import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MapPin, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.store';
import { useCartStore } from '@/features/cart/cart.store';

interface PageShellProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showLocationHeader?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({
  title,
  showBack = false,
  onBack,
  showLocationHeader = false,
  className = '',
  children,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const cartLines = useCartStore((s) => s.lines);
  const totalCartItems = cartLines.reduce((sum, line) => sum + line.quantity, 0);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/signup', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-gray-900 flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 shadow-subtle">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBack ? (
              <button
                type="button"
                onClick={handleBack}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-brand active:scale-95 transition-all"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            ) : (
              <Link to="/home" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-extrabold text-base shadow-xs shadow-brand/30">
                  F
                </div>
                <span className="font-extrabold text-base tracking-tight text-gray-900">
                  Fastor
                </span>
              </Link>
            )}

            {title && (
              <h1 className="text-sm md:text-base font-bold text-gray-900 truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-1.5 bg-gray-100/80 px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700">
                  <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-xs font-semibold flex items-center space-x-1"
                  title="Sign out to Signup screen"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4 stroke-[2]" />
                  <span className="hidden md:inline text-[11px]">Logout</span>
                </button>
              </div>
            )}

            {/* Cart Icon with badge */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl hover:bg-orange-50 text-gray-700 hover:text-brand transition-colors"
              aria-label={`Cart with ${totalCartItems} items`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-scale">
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Optional Location Subheader (Home Screen) */}
        {showLocationHeader && (
          <div className="bg-white border-t border-gray-100 px-4 md:px-6 py-2 max-w-6xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-brand stroke-[2.5]" />
              <span className="text-[11px] font-medium text-gray-400">Current Location:</span>
              <span className="font-bold text-gray-800 text-xs">Model Town, New Delhi</span>
            </div>
            {user && (
              <span className="sm:hidden text-[11px] font-bold text-gray-700">
                Hi, {user.name}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-4 md:py-6 ${className}`}>
        {children}
      </main>
    </div>
  );
};
