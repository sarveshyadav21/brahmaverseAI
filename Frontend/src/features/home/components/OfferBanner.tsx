import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Offer } from '@/types';

interface OfferBannerProps {
  offers: Offer[];
}

export const OfferBanner: React.FC<OfferBannerProps> = ({ offers }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!offers.length) return null;
  const current = offers[activeIndex] || offers[0];

  return (
    <div className="w-full my-4">
      <Link
        to="/items/pizza-lorem"
        className="block relative w-full h-36 sm:h-40 rounded-3xl overflow-hidden bg-gradient-to-r from-brand via-[#FF6D1F] to-brand shadow-card group transition-all"
      >
        {/* Banner Left Copy */}
        <div className="w-[60%] sm:w-[55%] h-full p-4 sm:p-6 text-white z-10 flex flex-col justify-center space-y-1 sm:space-y-1.5">
          <span className="text-xs sm:text-sm font-medium opacity-90 leading-tight">
            {current.title}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white drop-shadow-sm">
            {current.discount}
          </h3>
          <span className="text-[10px] text-white/80 font-medium">
            {current.subtitle}
          </span>
        </div>

        {/* Banner Right Image */}
        <div className="absolute right-0 top-0 bottom-0 w-[45%] overflow-hidden">
          <img
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Decorative circular shapes */}
        <div className="absolute -left-6 -bottom-8 w-24 h-24 rounded-full bg-white/10 pointer-events-none"></div>
        <div className="absolute left-36 -top-6 w-16 h-16 rounded-full bg-white/10 pointer-events-none"></div>
      </Link>

      {/* Pagination dots */}
      {offers.length > 1 && (
        <div className="flex justify-center items-center space-x-1.5 mt-2.5">
          {offers.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                activeIndex === idx
                  ? 'w-5 bg-brand'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
