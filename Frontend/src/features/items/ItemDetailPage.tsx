import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ShoppingBag } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { QuantityStepper } from './components/QuantityStepper';
import { PortionSelector } from './components/PortionSelector';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { getItemById } from '@/api/items.api';
import { useCartStore } from '@/features/cart/cart.store';
import { formatCurrency } from '@/lib/format';
import { MIN_ITEM_QUANTITY } from '@/lib/constants';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addLine = useCartStore((s) => s.addLine);

  const [quantity, setQuantity] = useState(0); // Initial 0 per request
  const [selectedPortionId, setSelectedPortionId] = useState<string>('');
  const [addedConfirmation, setAddedConfirmation] = useState(false);

  const {
    data: item,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['items', id],
    queryFn: () => getItemById(id || ''),
    enabled: Boolean(id),
  });

  // Set default portion once item loads
  React.useEffect(() => {
    if (item && item.portions.length > 0 && !selectedPortionId) {
      // Default to jumbo or the last/first option
      const defaultPortion =
        item.portions.find((p) => p.id === 'jumbo') || item.portions[0];
      setSelectedPortionId(defaultPortion.id);
    }
  }, [item, selectedPortionId]);

  // Unit price including selected portion
  const unitPrice = useMemo(() => {
    if (!item) return 0;
    const selectedPortion = item.portions.find((p) => p.id === selectedPortionId);
    const portionExtra = selectedPortion ? selectedPortion.price : 0;
    return item.price + portionExtra;
  }, [item, selectedPortionId]);

  // Display price: if quantity > 0 show total, otherwise show unit price
  const displayPrice = useMemo(() => {
    if (quantity === 0) return unitPrice;
    return unitPrice * quantity;
  }, [unitPrice, quantity]);

  const handleAddToCart = () => {
    if (!item || !selectedPortionId || quantity === 0) return;
    addLine(item.id, selectedPortionId, quantity);

    setAddedConfirmation(true);
    setTimeout(() => {
      setAddedConfirmation(false);
    }, 2500);
  };

  if (isLoading) {
    return (
      <PageShell showBack={true}>
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-gray-400 font-medium">Loading dish details...</p>
        </div>
      </PageShell>
    );
  }

  if (isError || !item) {
    return (
      <PageShell showBack={true}>
        <ErrorState
          title="Dish not found"
          message={error instanceof Error ? error.message : "The requested food item could not be found."}
          onRetry={refetch}
          showHomeLink={true}
        />
      </PageShell>
    );
  }

  return (
    <PageShell showBack={true} title={item.name} className="pb-28 md:pb-8">
      {/* Responsive layout: 2-column on md/lg, stacked on mobile */}
      <div className="bg-white rounded-3xl shadow-subtle border border-gray-100 overflow-hidden md:grid md:grid-cols-2 md:gap-8 max-w-5xl mx-auto">
        {/* Left Column: Hero Image */}
        <div className="relative aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-gray-900 rounded-b-3xl md:rounded-b-none md:rounded-l-3xl">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Right Column: Details & Customization */}
        <div className="p-5 sm:p-7 flex flex-col justify-between">
          <div>
            {/* Price & Quantity Stepper Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
                {formatCurrency(displayPrice)}
              </span>

              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
              />
            </div>

            {/* Title & Description */}
            <div className="mt-4 space-y-1.5">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                {item.name}
              </h1>
              <p className="text-xs text-gray-400 font-normal leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Portion Selector */}
            {item.portions.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <PortionSelector
                  portions={item.portions}
                  selectedId={selectedPortionId}
                  onSelect={setSelectedPortionId}
                />
              </div>
            )}
          </div>

          {/* Desktop Inline Add to Cart Button */}
          <div className="hidden md:block mt-8 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={quantity === 0}
              onClick={handleAddToCart}
              className="w-full text-base font-bold flex items-center justify-center space-x-2 shadow-md shadow-brand/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {addedConfirmation ? (
                <>
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>Added to Cart!</span>
                </>
              ) : quantity === 0 ? (
                <>
                  <ShoppingBag className="w-5 h-5 stroke-[2]" />
                  <span>Add to cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 stroke-[2]" />
                  <span>Add to cart — {formatCurrency(displayPrice)}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar with safe area padding */}
      <div className="md:hidden fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-30 shadow-lg">
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={quantity === 0}
          onClick={handleAddToCart}
          className="w-full text-base font-bold flex items-center justify-center space-x-2 shadow-md shadow-brand/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {addedConfirmation ? (
            <>
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Added to Cart!</span>
            </>
          ) : quantity === 0 ? (
            <>
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              <span>Add to cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              <span>Add to cart — {formatCurrency(displayPrice)}</span>
            </>
          )}
        </Button>
      </div>
    </PageShell>
  );
};
