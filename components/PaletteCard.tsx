import React from 'react';
import { Palette } from '../types';
import { Heart, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface PaletteCardProps {
  palette: Palette;
  onClick: (palette: Palette) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  isEditing?: boolean;
  onDelete?: (e: React.MouseEvent, id: string) => void;
  onMoveLeft?: (e: React.MouseEvent, index: number) => void;
  onMoveRight?: (e: React.MouseEvent, index: number) => void;
  index?: number;
  isFirst?: boolean;
  isLast?: boolean;
}

const PaletteCard: React.FC<PaletteCardProps> = ({ 
  palette, 
  onClick, 
  isFavorite, 
  onToggleFavorite,
  isEditing = false,
  onDelete,
  onMoveLeft,
  onMoveRight,
  index = 0,
  isFirst = false,
  isLast = false
}) => {
  return (
    <div 
      onClick={() => !isEditing && onClick(palette)}
      className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 relative
        ${isEditing ? 'border-dashed border-slate-300' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'}
      `}
    >
      {/* Top Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button
          onClick={(e) => onToggleFavorite(e, palette.id)}
          className={`p-2 rounded-full transition-colors backdrop-blur-sm shadow-sm
            ${isFavorite 
              ? 'bg-white/80 text-pink-500 fill-pink-500' 
              : 'bg-white/50 text-slate-400 hover:text-pink-400 hover:bg-white'
            }`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {isEditing && onDelete && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={(e) => onDelete(e, palette.id)}
            className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors shadow-sm"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Colors Preview */}
      <div className={`h-40 flex ${isEditing ? 'opacity-80' : ''}`}>
        {palette.colors.map((c) => (
          <div key={c.hex} className="flex-1 h-full" style={{ backgroundColor: c.hex }} />
        ))}
      </div>

      {/* Content */}
      <div className="p-5 relative">
        <h4 className={`font-serif font-medium text-lg mb-1 transition-colors ${!isEditing && 'group-hover:text-amber-600'}`}>
          {palette.name}
        </h4>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
          {palette.description}
        </p>

        {/* Edit Controls (Move) */}
        {isEditing && onMoveLeft && onMoveRight && (
          <div className="flex justify-between mt-4 border-t border-slate-100 pt-3">
             <button 
                onClick={(e) => onMoveLeft(e, index)}
                disabled={isFirst}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
             >
               <ArrowLeft size={16} />
             </button>
             <span className="text-xs text-slate-400 font-medium self-center uppercase tracking-widest">Move</span>
             <button 
                onClick={(e) => onMoveRight(e, index)}
                disabled={isLast}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
             >
               <ArrowRight size={16} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaletteCard;