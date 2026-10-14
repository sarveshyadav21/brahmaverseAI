import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, Search } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { BestSellerList } from './components/BestSellerList';
import { OfferBanner } from './components/OfferBanner';
import { OrderCard } from './components/OrderCard';
import { Spinner } from '@/components/Spinner';
import { ErrorState } from '@/components/ErrorState';
import { getItems } from '@/api/items.api';
import { getOffers, getOrders, cancelOrder } from '@/api/orders.api';
import { useAuthStore } from '@/features/auth/auth.store';

export const HomePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Queries
  const {
    data: bestSellers,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    refetch: refetchItems,
  } = useQuery({
    queryKey: ['items', 'bestSellers'],
    queryFn: () => getItems({ bestSeller: true }),
  });

  const { data: offers, isLoading: isLoadingOffers } = useQuery({
    queryKey: ['offers'],
    queryFn: getOffers,
  });

  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  // Mutation to cancel order
  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData<typeof orders>(['orders'], (old) => {
        if (!old) return [updatedOrder];
        return old.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      });
    },
  });

  const isLoading = isLoadingItems || isLoadingOffers || isLoadingOrders;
  const isError = isErrorItems || isErrorOrders;

  return (
    <PageShell showLocationHeader={true}>
      {/* Search & Call Action Row */}
      <div className="flex items-center space-x-3 mb-5">
        <div className="flex-1 h-11 bg-white border border-gray-200/80 rounded-2xl px-3.5 flex items-center space-x-2.5 text-xs text-gray-800 shadow-subtle focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
          <Search className="w-4 h-4 text-gray-400 stroke-[2.5]" />
          <input
            type="text"
            placeholder={`Search dishes for ${user?.name || 'you'}...`}
            className="bg-transparent outline-none w-full text-xs text-gray-900 font-medium placeholder-gray-400"
          />
        </div>

        {/* Call button per Section 8 decision: tel: link */}
        <a
          href="tel:+911800123456"
          className="w-11 h-11 rounded-2xl bg-fastor-salmon hover:opacity-90 active:scale-95 flex items-center justify-center text-white shadow-subtle transition-all flex-shrink-0"
          aria-label="Call Fastor Support"
          title="Call support"
        >
          <Phone className="w-4 h-4 stroke-[2.5]" />
        </a>
      </div>

      {/* Loading & Error Handling */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-gray-400 font-medium">Fetching best sellers and offers...</p>
        </div>
      )}

      {isError && (
        <ErrorState
          title="Could not load your food feed"
          message="There was an issue fetching dishes and orders. Please verify your connection."
          onRetry={() => {
            refetchItems();
            refetchOrders();
          }}
          showHomeLink={false}
        />
      )}

      {!isLoading && !isError && (
        <div className="space-y-6">
          {/* 1. Best Seller Section */}
          {bestSellers && bestSellers.length > 0 && (
            <BestSellerList items={bestSellers} />
          )}

          {/* 2. Promo Banner */}
          {offers && offers.length > 0 && <OfferBanner offers={offers} />}

          {/* 3. Popular Items / Order Cards */}
          <div className="mt-6">
            <h2 className="text-base font-bold text-gray-900 tracking-tight mb-3">
              Popular Items
            </h2>

            {orders && orders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCancelOrder={(id) => cancelMutation.mutate(id)}
                    isCancelling={
                      cancelMutation.isPending &&
                      cancelMutation.variables === order.id
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center text-xs text-gray-400 border border-gray-100">
                No orders yet. Place your first order from Best Sellers!
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
};
