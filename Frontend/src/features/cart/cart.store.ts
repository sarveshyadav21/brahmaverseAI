import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/types';
import { MAX_ITEM_QUANTITY, MIN_ITEM_QUANTITY } from '@/lib/constants';

interface CartState {
  lines: CartLine[];
  addLine: (itemId: string, portionId: string, quantity: number) => void;
  updateQuantity: (itemId: string, portionId: string, delta: number) => void;
  removeLine: (itemId: string, portionId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],

      addLine: (itemId, portionId, quantity) => {
        set((state) => {
          const existingIndex = state.lines.findIndex(
            (l) => l.itemId === itemId && l.portionId === portionId
          );

          if (existingIndex > -1) {
            const updated = [...state.lines];
            const newQty = Math.min(
              MAX_ITEM_QUANTITY,
              updated[existingIndex].quantity + quantity
            );
            updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
            return { lines: updated };
          }

          return {
            lines: [...state.lines, { itemId, portionId, quantity }],
          };
        });
      },

      updateQuantity: (itemId, portionId, delta) => {
        set((state) => {
          const updated = state.lines
            .map((l) => {
              if (l.itemId === itemId && l.portionId === portionId) {
                const newQty = l.quantity + delta;
                return newQty >= MIN_ITEM_QUANTITY ? { ...l, quantity: newQty } : null;
              }
              return l;
            })
            .filter((l): l is CartLine => l !== null);

          return { lines: updated };
        });
      },

      removeLine: (itemId, portionId) => {
        set((state) => ({
          lines: state.lines.filter(
            (l) => !(l.itemId === itemId && l.portionId === portionId)
          ),
        }));
      },

      clear: () => set({ lines: [] }),
    }),
    {
      name: 'fastor_cart_storage',
    }
  )
);
