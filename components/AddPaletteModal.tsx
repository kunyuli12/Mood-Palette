import React, { useState } from 'react';
import { Palette } from '../types';
import { X, Check } from 'lucide-react';

interface AddPaletteModalProps {
  onClose: () => void;
  onSave: (palette: Palette) => void;
  labels: {
    title: string;
    create: string;
    cancel: string;
    paletteName: string;
    paletteDesc: string;
    colorCodes: string;
    invalidHex: string;
  };
}

const AddPaletteModal: React.FC<AddPaletteModalProps> = ({ onClose, onSave, labels }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Initialize 5 empty strings
  const [colors, setColors] = useState<string[]>(['', '', '', '', '']);

  const isValidHex = (hex: string) => /^#[0-9A-Fa-f]{6}$/.test(hex);

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    // Auto-add # if missing and length makes sense
    if (value.length === 6 && !value.startsWith('#')) {
        newColors[index] = '#' + value;
    } else {
        newColors[index] = value;
    }
    setColors(newColors);
  };

  const isFormValid = name.trim() !== '' && colors.every(c => isValidHex(c));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const newPalette: Palette = {
      id: Date.now().toString(),
      name: name,
      description: description || 'Custom Palette',
      designAdvice: 'Manual creation',
      colors: colors.map((hex, i) => ({
        hex: hex,
        name: hex, // Use hex as name for manual entry to keep it simple
      })),
      createdAt: Date.now(),
    };

    onSave(newPalette);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-200 p-8 border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-serif font-medium text-slate-800 mb-6">{labels.title}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{labels.paletteName}</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Palette"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{labels.paletteDesc}</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">{labels.colorCodes}</label>
              <div className="space-y-3">
                {colors.map((color, index) => {
                  const valid = isValidHex(color);
                  return (
                    <div key={index} className="flex items-center gap-3">
                       <div 
                         className="w-10 h-10 rounded-full border border-slate-200 shadow-sm transition-colors flex-shrink-0"
                         style={{ backgroundColor: valid ? color : '#f8fafc' }}
                       />
                       <input 
                          type="text"
                          value={color}
                          onChange={(e) => handleColorChange(index, e.target.value)}
                          placeholder="#000000"
                          maxLength={7}
                          className={`flex-1 px-4 py-3 rounded-lg border outline-none font-mono text-sm uppercase transition-all bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white ${
                             color && !valid 
                               ? 'border-red-300 focus:border-red-400 text-red-500' 
                               : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'
                          }`}
                       />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
             <button
               type="button"
               onClick={onClose}
               className="px-5 py-2.5 rounded-full text-slate-500 hover:bg-slate-100 transition-colors font-medium text-sm"
             >
               {labels.cancel}
             </button>
             <button
               type="submit"
               disabled={!isFormValid}
               className="px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
               <Check size={16} />
               {labels.create}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaletteModal;