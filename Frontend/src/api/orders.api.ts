import { apiClient } from './client';
import type { Order, Offer } from '@/types';

export async function getOrders(): Promise<Order[]> {
  return apiClient<Order[]>('/orders');
}

export async function cancelOrder(id: string): Promise<Order> {
  return apiClient<Order>(`/orders/${id}/cancel`, {
    method: 'POST',
  });
}

export async function getOffers(): Promise<Offer[]> {
  return apiClient<Offer[]>('/offers');
}
