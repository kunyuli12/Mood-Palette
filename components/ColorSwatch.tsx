import React, { useState } from 'react';
import { Color } from '../types';
import { Check, Copy } from 'lucide-react';

interface ColorSwatchProps {
  color: Color;
  index: number;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine text color based on brightness roughly
  const isLight = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 150;
  };

  const textColorClass = isLight(color.hex) ? 'text-slate-800' : 'text-white';

  return (
    <div 
      className={`group relative flex flex-col justify-end p-6 h-64 md:h-80 transition-all duration-500 ease-out hover:grow-[1.5] cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-lg`}
      style={{ backgroundColor: color.hex }}
      onClick={handleCopy}
    >
      <div className={`absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${textColorClass}`}>
        {copied ? <Check size={18} /> : <Copy size={18} />}
      </div>
      
      <div className={`transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ${textColorClass}`}>
        <p className="text-xs uppercase tracking-widest opacity-80 mb-1">
          {color.hex}
        </p>
        <h4 className="text-xl md:text-2xl serif font-medium">
          {color.name}
        </h4>
      </div>
    </div>
  );
};

export default ColorSwatch;