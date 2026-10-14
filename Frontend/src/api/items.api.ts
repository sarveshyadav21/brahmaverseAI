import { apiClient } from './client';
import type { Item } from '@/types';

export async function getItems(params?: { bestSeller?: boolean }): Promise<Item[]> {
  const query = params?.bestSeller ? '?bestSeller=true' : '';
  return apiClient<Item[]>(`/items${query}`);
}

export async function getItemById(id: string): Promise<Item> {
  return apiClient<Item>(`/items/${id}`);
}
