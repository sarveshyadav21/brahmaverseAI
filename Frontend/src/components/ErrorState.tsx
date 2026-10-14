import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeLink?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not load this content. Please check your connection and try again.',
  onRetry,
  showHomeLink = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-2xl border border-gray-100 shadow-subtle max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 stroke-[2]" />
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed max-w-xs mb-6">
        {message}
      </p>

      <div className="flex items-center space-x-3">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Try again
          </Button>
        )}

        {showHomeLink && (
          <Link to="/home">
            <Button variant="primary" size="sm">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Back to Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
