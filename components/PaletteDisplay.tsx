import React, { useRef, useState } from 'react';
import { Palette } from '../types';
import ColorSwatch from './ColorSwatch';
import { Download, ImageIcon, Loader2, RefreshCw, Pencil, Maximize2, X } from 'lucide-react';
import { toPng } from 'html-to-image';

interface PaletteDisplayProps {
  palette: Palette;
  labels: {
    currentSelection: string;
    designSuggestions: string;
    exportJson: string;
    visualize: string;
    painting: string;
    imageInputPlaceholder?: string;
    imageInputLabel?: string;
  };
  generatedImage: string | null;
  isGeneratingImage: boolean;
  onGenerateImage: (keywords?: string) => void;
  onResetImage: () => void;
}

const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ 
  palette, 
  labels, 
  generatedImage, 
  isGeneratingImage, 
  onGenerateImage,
  onResetImage
}) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageKeywords, setImageKeywords] = useState('');

  const handleDownload = async () => {
    if (exportRef.current === null) {
      return;
    }
    
    try {
      const dataUrl = await toPng(exportRef.current, { 
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#FFFFFF',
      });
      
      const link = document.createElement('a');
      link.download = `MoodPalette_${palette.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
    }
  };

  const handleGenerateClick = () => {
    // If we are regenerating, we might want to use the existing keywords or the input
    if (imageKeywords.trim()) {
      onGenerateImage(imageKeywords);
    } else {
      onGenerateImage(undefined);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12 animate-fade-in bg-inherit">
      {/* Hidden Export Template - Modern Mood Board Style */}
      <div style={{ position: 'fixed', top: 0, left: '-9999px', width: '1080px', zIndex: -10 }}>
        <div ref={exportRef} className="bg-white p-16 flex flex-col h-auto text-slate-800 font-sans relative overflow-hidden">
          
          {/* Main Visual - Takes up significant space */}
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm bg-slate-50 relative mb-12">
            {generatedImage ? (
              <img src={generatedImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100 p-12 text-center">
                 <div className="flex gap-0 w-full h-full opacity-30 absolute inset-0">
                   {palette.colors.map(c => (
                     <div key={c.hex} className="flex-1 h-full" style={{ backgroundColor: c.hex }}></div>
                   ))}
                 </div>
              </div>
            )}
          </div>

          {/* Color Palette Row - Elegant Circles */}
          <div className="flex justify-between items-start mb-12 px-4">
             {palette.colors.map((c) => (
               <div key={c.hex} className="flex flex-col items-center gap-4">
                 <div 
                    className="w-32 h-32 rounded-full shadow-md border-4 border-white"
                    style={{ backgroundColor: c.hex }}
                 />
                 <div className="text-center">
                   <div className="font-bold text-slate-800 text-lg uppercase tracking-wider">{c.hex}</div>
                   <div className="text-slate-500 text-sm mt-1 font-medium">{c.name}</div>
                 </div>
               </div>
             ))}
          </div>

          {/* Info Footer */}
          <div className="border-t-2 border-slate-100 pt-10 flex justify-between items-start">
             <div className="max-w-2xl">
                <h1 className="text-5xl font-serif font-medium mb-4 text-slate-900">{palette.name}</h1>
                <p className="text-slate-500 text-xl leading-relaxed italic">{palette.description}</p>
             </div>
             <div className="text-right">
                <div className="text-sm font-bold tracking-[0.2em] uppercase text-slate-400 mb-2">Mood Palette</div>
                <div className="text-slate-400 text-sm">AI Color Inspiration</div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Visible Display */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <span className="text-sm font-medium tracking-widest text-slate-400 uppercase mb-2 block">
            {labels.currentSelection}
          </span>
          <h2 className="text-4xl md:text-5xl text-slate-800 font-medium serif mb-4">
            {palette.name}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl font-light italic">
            "{palette.description}"
          </p>
        </div>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors text-sm font-medium"
        >
          <Download size={16} />
          {labels.exportJson}
        </button>
      </div>

      {/* Mood Image Section */}
      <div className="mb-12">
        {generatedImage ? (
          <div className="relative group rounded-2xl overflow-hidden shadow-md">
            <div 
              className="w-full h-64 md:h-[500px] cursor-zoom-in relative"
              onClick={() => setIsZoomed(true)}
            >
               <img 
                 src={generatedImage} 
                 alt={palette.name} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Control Overlay */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
               <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(true);
                  }}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-slate-700 hover:text-slate-900 hover:bg-white shadow-lg transition-all transform hover:scale-110"
                  title="Zoom"
               >
                 <Maximize2 size={20} />
               </button>
               <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetImage();
                  }}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-slate-700 hover:text-slate-900 hover:bg-white shadow-lg transition-all transform hover:scale-110"
                  title="Edit Keywords"
               >
                 <Pencil size={20} />
               </button>
               <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateClick();
                  }}
                  disabled={isGeneratingImage}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-slate-700 hover:text-slate-900 hover:bg-white shadow-lg transition-all transform hover:scale-110 disabled:opacity-70"
                  title="Regenerate"
               >
                 {isGeneratingImage ? <Loader2 className="animate-spin" size={20}/> : <RefreshCw size={20} />}
               </button>
            </div>

            {/* Keyword Badge */}
            {imageKeywords && (
               <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {imageKeywords}
               </div>
            )}

            {/* Lightbox Overlay */}
            {isZoomed && (
              <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl transition-all duration-500 cursor-zoom-out animate-in fade-in"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(false);
                }}
              >
                 <button className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                    <X size={24} />
                 </button>
                 <img 
                   src={generatedImage} 
                   alt={palette.name} 
                   className="max-w-[90vw] max-h-[90vh] shadow-2xl rounded-lg object-contain animate-in zoom-in-95 duration-300"
                 />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50/50 p-8 md:p-12 gap-6 transition-all hover:border-slate-300">
            
            <div className="text-center max-w-md w-full space-y-4">
              <h3 className="text-slate-600 font-medium serif text-lg">{labels.imageInputLabel}</h3>
              
              <div className="relative w-full group">
                <input 
                  type="text" 
                  value={imageKeywords}
                  onChange={(e) => setImageKeywords(e.target.value)}
                  placeholder={labels.imageInputPlaceholder}
                  maxLength={30}
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none text-slate-900 placeholder:text-slate-400 text-center transition-all shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerateClick();
                  }}
                  disabled={isGeneratingImage}
                />
                <div className="absolute right-3 top-4.5 text-xs text-slate-400 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                  {imageKeywords.length}/30
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerateClick}
              disabled={isGeneratingImage}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 group"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 size={18} className="animate-spin text-slate-400" />
                  {labels.painting}
                </>
              ) : (
                <>
                  <ImageIcon size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  {labels.visualize}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
        {palette.colors.map((color, index) => (
          <ColorSwatch key={`${palette.id}-${index}`} color={color} index={index} />
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-xl font-medium text-slate-800 mb-3 serif">{labels.designSuggestions}</h3>
        <p className="text-slate-600 leading-relaxed">
          {palette.designAdvice}
        </p>
      </div>
    </div>
  );
};

export default PaletteDisplay;