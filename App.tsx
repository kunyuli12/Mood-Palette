import React, { useState } from 'react';
import { Palette, Language } from './types';
import { UI_TEXT, LANGUAGES, POPULAR_PALETTES } from './constants';
import PaletteDisplay from './components/PaletteDisplay';
import PaletteCard from './components/PaletteCard';
import AddPaletteModal from './components/AddPaletteModal';
import { generatePaletteFromMood, generateMoodImage } from './services/geminiService';
import { Loader2, Sparkles, Globe, Palette as PaletteIcon, Search, ArrowRight, ArrowLeft, History, SlidersHorizontal, Check, Plus } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('zh-TW');
  const [currentPalette, setCurrentPalette] = useState<Palette | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // New state for history and tabs
  const [history, setHistory] = useState<Palette[]>([]);
  const [activeTab, setActiveTab] = useState<'trending' | 'history'>('trending');
  
  // Favorites, Editing, Adding state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const t = UI_TEXT[language];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setCurrentPalette(null); 

    try {
      const result = await generatePaletteFromMood(prompt, language);
      const newPalette: Palette = {
        id: Date.now().toString(),
        name: result.name,
        description: result.description,
        designAdvice: result.designAdvice,
        colors: result.colors,
        createdAt: Date.now(),
      };
      
      setHistory(prev => [newPalette, ...prev]);
      setActiveTab('history');
      // If we are editing, stop editing when a new one is added
      setIsEditing(false);
      setCurrentPalette(newPalette);
      
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualAdd = (palette: Palette) => {
    setHistory(prev => [palette, ...prev]);
    setIsAdding(false);
    setActiveTab('history');
    setIsEditing(false);
  };

  const handleGenerateImage = async (keywords?: string) => {
    const p = currentPalette;
    if (!p) return;
    
    setIsGeneratingImage(true);
    try {
      const imageBase64 = await generateMoodImage(p, keywords);
      setGeneratedImage(imageBase64);
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleReset = () => {
    setCurrentPalette(null);
    setGeneratedImage(null);
    setError(null);
    setPrompt('');
  };

  const handleSelectPalette = (palette: Palette) => {
    setCurrentPalette(palette);
    setGeneratedImage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(id)) {
        newFavs.delete(id);
      } else {
        newFavs.add(id);
      }
      return newFavs;
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(p => p.id !== id));
  };

  const handleMove = (e: React.MouseEvent, index: number, direction: 'left' | 'right') => {
    e.stopPropagation();
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === history.length - 1) return;

    const newHistory = [...history];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    // Swap
    [newHistory[index], newHistory[targetIndex]] = [newHistory[targetIndex], newHistory[index]];
    setHistory(newHistory);
  };

  // Sorting Logic: Favorites first
  const sortPalettes = (list: Palette[]) => {
    if (isEditing) return list; // Disable sorting while editing to avoid jumping
    return [...list].sort((a, b) => {
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav === bFav) return 0;
      return aFav ? -1 : 1;
    });
  };

  const sortedPopular = sortPalettes(POPULAR_PALETTES);
  const sortedHistory = sortPalettes(history);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 selection:bg-slate-200 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            onClick={handleReset}
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <PaletteIcon className="text-slate-800" size={24} />
            <h1 className="text-xl font-semibold tracking-tight serif">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors text-slate-600">
                <Globe size={14} />
                <select 
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent outline-none appearance-none cursor-pointer pr-2"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="text-slate-800">{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-20">
        
        {/* Search / Hero Section */}
        <div className="bg-white border-b border-slate-100 mb-12">
            <div className="max-w-3xl mx-auto px-6 py-16 text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4 text-slate-800">
                    {t.heroTitle}
                </h2>
                <p className="text-slate-500 mb-8">{t.heroDesc}</p>
                
                <div className="relative max-w-xl mx-auto">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                        <Search size={20} />
                    </div>
                    <form onSubmit={handleGenerate} className="relative">
                        <input 
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t.placeholder}
                            className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-full outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all shadow-sm text-lg"
                            disabled={isGenerating}
                        />
                        <button 
                            type="submit"
                            disabled={isGenerating || !prompt.trim()}
                            className="absolute right-2 top-2 bottom-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white px-6 rounded-full font-medium transition-colors flex items-center gap-2"
                        >
                            {isGenerating ? (
                            <Loader2 size={18} className="animate-spin" />
                            ) : (
                            <>
                                <span className="hidden sm:inline">{t.generate}</span>
                                <ArrowRight size={18} />
                            </>
                            )}
                        </button>
                    </form>
                </div>
                 {error && (
                    <div className="mt-4 text-center text-red-500 text-sm bg-red-50 py-2 rounded-lg inline-block px-4">
                    {error}
                    </div>
                )}
            </div>
        </div>

        {/* Conditional Rendering: Detail View vs Grid View */}
        {currentPalette ? (
          <>
            {/* Back Button */}
            <div className="max-w-6xl mx-auto px-6 mb-2 animate-fade-in">
              <button 
                onClick={() => setCurrentPalette(null)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors px-3 py-2 rounded-lg hover:bg-white"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">{t.backToHome}</span>
              </button>
            </div>
            
            <PaletteDisplay 
                palette={currentPalette} 
                labels={{
                    currentSelection: t.currentSelection,
                    designSuggestions: t.designSuggestions,
                    exportJson: t.exportJson,
                    visualize: t.visualize,
                    painting: t.painting,
                    imageInputPlaceholder: t.imageInputPlaceholder,
                    imageInputLabel: t.imageInputLabel
                }}
                generatedImage={generatedImage}
                isGeneratingImage={isGeneratingImage}
                onGenerateImage={handleGenerateImage}
                onResetImage={() => setGeneratedImage(null)}
            />
          </>
        ) : (
            <div className="max-w-6xl mx-auto px-6 animate-fade-in">
                {/* Tabs */}
                <div className="flex items-center justify-between mb-8 border-b border-slate-200">
                    <div className="flex items-center gap-8">
                        <button 
                          onClick={() => {
                            setActiveTab('trending');
                            setIsEditing(false);
                          }}
                          className={`pb-4 flex items-center gap-2 font-serif text-lg transition-colors relative ${
                            activeTab === 'trending' 
                              ? 'text-slate-800 font-medium' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                            <Sparkles size={18} className={activeTab === 'trending' ? 'text-amber-500' : ''} />
                            {t.trending}
                            {activeTab === 'trending' && (
                              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-800 rounded-t-full" />
                            )}
                        </button>
                        
                        <button 
                          onClick={() => setActiveTab('history')}
                          className={`pb-4 flex items-center gap-2 font-serif text-lg transition-colors relative ${
                            activeTab === 'history' 
                              ? 'text-slate-800 font-medium' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                            <History size={18} className={activeTab === 'history' ? 'text-blue-500' : ''} />
                            {t.myPalettes}
                            {activeTab === 'history' && (
                              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-800 rounded-t-full" />
                            )}
                        </button>
                    </div>

                    {/* Adjust and Add Buttons for History Tab */}
                    {activeTab === 'history' && (
                        <div className="mb-2 flex gap-2">
                             <button 
                              onClick={() => setIsAdding(true)}
                              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 shadow-sm"
                            >
                                <Plus size={14} /> {t.addPalette}
                            </button>

                            {history.length > 0 && (
                                <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                                    isEditing 
                                    ? 'bg-slate-200 text-slate-800' 
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                                >
                                {isEditing ? (
                                    <>
                                    <Check size={14} /> {t.done}
                                    </>
                                ) : (
                                    <>
                                    <SlidersHorizontal size={14} /> {t.adjust}
                                    </>
                                )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
                
                {activeTab === 'trending' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {sortedPopular.map((palette) => (
                          <PaletteCard 
                            key={palette.id}
                            palette={palette}
                            onClick={handleSelectPalette}
                            isFavorite={favorites.has(palette.id)}
                            onToggleFavorite={toggleFavorite}
                          />
                      ))}
                  </div>
                ) : (
                  // History Tab Content
                  <div>
                    {history.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                        <History size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{t.noHistory}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                          {sortedHistory.map((palette, index) => (
                              <PaletteCard 
                                key={palette.id}
                                palette={palette}
                                onClick={handleSelectPalette}
                                isFavorite={favorites.has(palette.id)}
                                onToggleFavorite={toggleFavorite}
                                isEditing={isEditing}
                                onDelete={handleDelete}
                                onMoveLeft={(e, idx) => handleMove(e, idx, 'left')}
                                onMoveRight={(e, idx) => handleMove(e, idx, 'right')}
                                index={index}
                                isFirst={index === 0}
                                isLast={index === sortedHistory.length - 1}
                              />
                          ))}
                      </div>
                    )}
                  </div>
                )}
            </div>
        )}

        {isAdding && (
          <AddPaletteModal 
            onClose={() => setIsAdding(false)}
            onSave={handleManualAdd}
            labels={{
                title: t.addPalette,
                create: t.create,
                cancel: t.cancel,
                paletteName: t.paletteName,
                paletteDesc: t.paletteDesc,
                colorCodes: t.colorCodes,
                invalidHex: t.invalidHex
            }}
          />
        )}

      </main>

      <footer className="py-8 text-center text-sm border-t border-slate-100 mt-auto text-slate-400">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}