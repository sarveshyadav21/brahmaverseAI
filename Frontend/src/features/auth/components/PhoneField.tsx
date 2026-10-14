import React from 'react';
import { PHONE_PREFIX, PHONE_LENGTH } from '@/lib/constants';

interface PhoneFieldProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, PHONE_LENGTH);
    onChange(raw);
  };

  return (
    <div className="w-full">
      <label htmlFor="phone-input" className="sr-only">
        Mobile Phone Number
      </label>
      <div
        className={`w-full h-12 bg-white border rounded-2xl px-4 flex items-center text-sm font-medium transition-all shadow-subtle ${
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : 'border-gray-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10'
        }`}
      >
        <span className="text-gray-900 font-semibold tracking-wide mr-2 select-none">
          {PHONE_PREFIX}
        </span>
        <span className="h-4 w-[1px] bg-gray-300 mr-2.5"></span>
        <input
          id="phone-input"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          value={value}
          onChange={handleChange}
          placeholder="00000 00000"
          className="w-full bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400 text-sm tracking-wider disabled:opacity-50"
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium pl-1">{error}</p>
      )}
    </div>
  );
};
