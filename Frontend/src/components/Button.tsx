import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'soft' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 min-h-[44px]',
    lg: 'text-base px-6 py-3 min-h-[50px]',
  };

  const variantStyles = {
    primary:
      'bg-brand text-white hover:bg-brand-hover focus:ring-brand shadow-sm shadow-brand/20',
    secondary:
      'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700',
    outline:
      'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-400',
    soft: 'bg-brand-soft text-brand hover:bg-orange-100 border border-brand/20 focus:ring-brand',
    danger:
      'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-500',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <Spinner size="sm" className="text-current" />
          <span>Please wait...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
