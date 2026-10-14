import { mockItems, mockOffers, mockOrders } from './data';
import { DEMO_OTP, PHONE_LENGTH } from '@/lib/constants';
import { ApiError } from '@/api/client';

let ordersState = [...mockOrders];

export async function handleMockFallback<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Artificial latency simulation
  await new Promise((resolve) => setTimeout(resolve, 250));

  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // 1. POST /auth/otp/request
  if (endpoint.startsWith('/auth/otp/request') && method === 'POST') {
    const phone = body.phone?.trim() || '';
    if (phone.length !== PHONE_LENGTH) {
      throw new ApiError(422, `Phone number must be exactly ${PHONE_LENGTH} digits.`);
    }
    return { ok: true } as unknown as T;
  }

  // 2. POST /auth/otp/verify
  if (endpoint.startsWith('/auth/otp/verify') && method === 'POST') {
    const { phone, code } = body;
    if (code !== DEMO_OTP) {
      throw new ApiError(400, `Invalid code. Please enter demo code ${DEMO_OTP}.`);
    }
    return {
      token: 'fastor-mock-jwt-token-xyz',
      user: {
        id: 'user-karan-1',
        name: 'Karan',
        phone: phone || '9876543210',
      },
    } as unknown as T;
  }

  // 3. GET /items
  if (endpoint.startsWith('/items') && method === 'GET') {
    if (endpoint.includes('?bestSeller=true')) {
      return mockItems.filter((i) => i.isBestSeller) as unknown as T;
    }
    const idMatch = endpoint.match(/\/items\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      const item = mockItems.find((i) => i.id === idMatch[1]);
      if (!item) throw new ApiError(404, 'Item not found');
      return item as unknown as T;
    }
    return mockItems as unknown as T;
  }

  // 4. GET /offers
  if (endpoint.startsWith('/offers') && method === 'GET') {
    return mockOffers as unknown as T;
  }

  // 5. GET /orders
  if (endpoint.startsWith('/orders') && method === 'GET') {
    return ordersState as unknown as T;
  }

  // 6. POST /orders/:id/cancel
  if (endpoint.includes('/cancel') && method === 'POST') {
    const idMatch = endpoint.match(/\/orders\/([a-zA-Z0-9_-]+)\/cancel/);
    if (idMatch && idMatch[1]) {
      const idx = ordersState.findIndex((o) => o.id === idMatch[1]);
      if (idx !== -1) {
        ordersState[idx] = { ...ordersState[idx], status: 'cancelled' };
        return ordersState[idx] as unknown as T;
      }
    }
    throw new ApiError(404, 'Order not found');
  }

  throw new ApiError(404, `Endpoint ${endpoint} not found`);
}
