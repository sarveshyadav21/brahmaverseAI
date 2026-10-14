import React from 'react';
import type { Order } from '@/types';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/Button';

interface OrderCardProps {
  order: Order;
  onCancelOrder: (id: string) => void;
  isCancelling?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancelOrder,
  isCancelling = false,
}) => {
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel order for "${order.itemName}"?`)) {
      onCancelOrder(order.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100 shadow-subtle hover:shadow-card transition-all flex space-x-3.5 items-center">
      {/* Thumbnail */}
      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
        <img
          src={order.itemImage}
          alt={order.itemName}
          className={`w-full h-full object-cover ${isCancelled ? 'grayscale opacity-75' : ''}`}
        />
        {isCancelled && (
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">
            Cancelled
          </span>
        )}
      </div>

      {/* Order Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="pr-2">
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
              {order.itemName}
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">{order.date}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-xs sm:text-sm font-extrabold text-brand">
              {formatCurrency(order.price)}
            </span>
            <p className="text-[10px] text-gray-400 font-medium">
              {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-2.5">
          {!isCancelled && !isDelivered && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCancel}
              isLoading={isCancelling}
              className="text-[11px] px-3 py-1 min-h-[30px] rounded-lg"
            >
              Cancel Order
            </Button>
          )}

          {isCancelled && (
            <span className="text-[11px] font-semibold text-gray-400 py-1">
              Order has been cancelled
            </span>
          )}

          {!isCancelled && (
            <div title="Coming soon">
              <Button
                type="button"
                variant="soft"
                size="sm"
                disabled
                className="text-[11px] px-3 py-1 min-h-[30px] rounded-lg cursor-not-allowed opacity-75"
              >
                Track Driver
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
