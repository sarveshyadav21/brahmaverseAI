import React from 'react';
import { Link } from 'react-router-dom';
import type { Item } from '@/types';
import { formatCurrency } from '@/lib/format';

interface BestSellerListProps {
  items: Item[];
}

export const BestSellerList: React.FC<BestSellerListProps> = ({ items }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          Best Seller
        </h2>
      </div>

      {/* Responsive layout: Horizontal snap scroll on mobile/tablet, grid on desktop */}
      <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-3.5 overflow-x-auto no-scrollbar pb-1 snap-x">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/items/${item.id}`}
            className="flex-shrink-0 w-28 md:w-auto snap-start group"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/80 shadow-subtle group-hover:shadow-card transition-all duration-200">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Bottom gradient overlay with price badge */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 flex items-end">
                <span className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
                  {formatCurrency(item.price)}
                </span>
              </div>
            </div>
            <p className="mt-1.5 text-xs font-semibold text-gray-800 truncate px-0.5 group-hover:text-brand transition-colors">
              {item.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};
