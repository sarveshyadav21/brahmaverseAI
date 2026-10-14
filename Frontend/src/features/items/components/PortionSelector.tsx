import React from 'react';
import type { Portion } from '@/types';
import { formatCurrency } from '@/lib/format';

interface PortionSelectorProps {
  portions: Portion[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export const PortionSelector: React.FC<PortionSelectorProps> = ({
  portions,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <h3 className="text-xs font-bold text-gray-900 tracking-tight uppercase text-gray-400 mb-3">
        Personal portion
      </h3>

      <div className="space-y-3" role="radiogroup" aria-label="Portion size selection">
        {portions.map((portion) => {
          const isSelected = selectedId === portion.id;
          return (
            <label
              key={portion.id}
              className={`flex items-center justify-between cursor-pointer group py-1 select-none ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                type="radio"
                name="portion"
                value={portion.id}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onSelect(portion.id)}
                className="sr-only"
              />

              {/* Portion Name */}
              <span className="text-xs sm:text-sm text-gray-800 font-medium whitespace-nowrap group-hover:text-gray-900 transition-colors">
                {portion.name}
              </span>

              {/* Dotted leader connector */}
              <span className="flex-1 mx-3 border-b border-dotted border-gray-300 self-center"></span>

              {/* Price Delta */}
              <span className="text-xs text-gray-500 font-semibold mr-3 tabular-nums">
                {portion.price === 0 ? 'Included' : `+${formatCurrency(portion.price)}`}
              </span>

              {/* Custom Radio Button */}
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-brand bg-white ring-2 ring-brand/20'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand"></div>}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
