import React, { useRef, useEffect } from 'react';
import { OTP_LENGTH } from '@/lib/constants';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus the first empty input on initial mount
    const firstEmptyIndex = digits.findIndex((d) => d === '');
    const indexToFocus = firstEmptyIndex === -1 ? OTP_LENGTH - 1 : firstEmptyIndex;
    inputRefs.current[indexToFocus]?.focus();
  }, []);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      // Clear current digit
      const next = digits.slice();
      next[index] = '';
      onChange(next.join(''));
      return;
    }

    const char = rawVal[rawVal.length - 1];
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(''));

    // Move to next input if available
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    onChange(pasted);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-between max-w-sm mx-auto">
      {/* First 3 boxes */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={digits[i]}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            className="w-10 h-12 sm:w-11 sm:h-13 bg-white border border-gray-200 rounded-xl text-center text-lg font-bold text-gray-900 outline-none transition-all shadow-subtle focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-50"
          />
        ))}
      </div>

      {/* Group separator dash */}
      <span className="text-gray-400 font-bold px-1 select-none text-base">-</span>

      {/* Second 3 boxes */}
      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {[3, 4, 5].map((i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={digits[i]}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            className="w-10 h-12 sm:w-11 sm:h-13 bg-white border border-gray-200 rounded-xl text-center text-lg font-bold text-gray-900 outline-none transition-all shadow-subtle focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-50"
          />
        ))}
      </div>
    </div>
  );
};
