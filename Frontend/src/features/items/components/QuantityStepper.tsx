import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { MIN_ITEM_QUANTITY, MAX_ITEM_QUANTITY } from '@/lib/constants';

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (value > MIN_ITEM_QUANTITY) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < MAX_ITEM_QUANTITY) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center space-x-3 select-none">
      <button
        type="button"
        disabled={disabled || value <= MIN_ITEM_QUANTITY}
        onClick={handleDecrement}
        aria-label="Decrease quantity"
        className="w-8 h-8 rounded-full bg-brand hover:bg-brand-hover text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 shadow-2xs"
      >
        <Minus className="w-4 h-4 stroke-[3]" />
      </button>

      <span className="font-extrabold text-base text-gray-900 w-6 text-center tabular-nums">
        {value}
      </span>

      <button
        type="button"
        disabled={disabled || value >= MAX_ITEM_QUANTITY}
        onClick={handleIncrement}
        aria-label="Increase quantity"
        className="w-8 h-8 rounded-full bg-brand hover:bg-brand-hover text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 shadow-2xs"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
      </button>
    </div>
  );
};
