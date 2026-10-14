import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/Button';
import { useCartStore } from './cart.store';
import { getItems } from '@/api/items.api';
import { formatCurrency } from '@/lib/format';

export const CartPage: React.FC = () => {
  const { lines, updateQuantity, removeLine, clear } = useCartStore();

  const { data: allItems } = useQuery({
    queryKey: ['items'],
    queryFn: () => getItems(),
  });

  const cartDetails = lines.map((line) => {
    const item = allItems?.find((i) => i.id === line.itemId);
    const portion = item?.portions.find((p) => p.id === line.portionId);
    const unitPrice = (item?.price || 0) + (portion?.price || 0);
    const lineTotal = unitPrice * line.quantity;

    return {
      ...line,
      item,
      portion,
      unitPrice,
      lineTotal,
    };
  });

  const subtotal = cartDetails.reduce((sum, line) => sum + line.lineTotal, 0);
  const deliveryFee = subtotal > 0 ? 30.0 : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <PageShell showBack={true} title="Your Cart">
      <div className="max-w-3xl mx-auto">
        {lines.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-subtle my-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-brand flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 stroke-[2]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h2>
            <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto">
              Explore our best sellers and add your favorite dishes to get started!
            </p>
            <Link to="/home">
              <Button variant="primary">
                Explore Menu <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-subtle divide-y divide-gray-100">
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400">
                  Cart Items ({lines.length})
                </h2>
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>

              {cartDetails.map((line, idx) => (
                <div key={`${line.itemId}-${line.portionId}-${idx}`} className="py-4 flex items-center space-x-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={line.item?.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80'}
                      alt={line.item?.name || 'Dish'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {line.item?.name || 'Loading dish...'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {line.portion?.name || 'Standard'}
                    </p>
                    <span className="text-xs font-extrabold text-brand mt-1 block">
                      {formatCurrency(line.lineTotal)}
                    </span>
                  </div>

                  {/* Stepper & Delete */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.itemId, line.portionId, -1)}
                        className="w-6 h-6 rounded-lg bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center active:scale-95 shadow-2xs"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span className="text-xs font-bold text-gray-900 w-4 text-center">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.itemId, line.portionId, 1)}
                        className="w-6 h-6 rounded-lg bg-white text-gray-700 hover:bg-gray-100 flex items-center justify-center active:scale-95 shadow-2xs"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLine(line.itemId, line.portionId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-subtle space-y-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
                Order Summary
              </h3>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-600">
                <span>Delivery & Packaging</span>
                <span className="font-semibold text-gray-900">{formatCurrency(deliveryFee)}</span>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between text-base font-extrabold text-gray-900">
                <span>To Pay</span>
                <span className="text-brand">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-base font-bold shadow-md shadow-brand/20"
                  onClick={() => alert(`Order placed successfully! Amount: ${formatCurrency(grandTotal)}`)}
                >
                  Proceed to Checkout — {formatCurrency(grandTotal)}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};
