import { http, HttpResponse, delay } from 'msw';
import { mockItems, mockOffers, mockOrders } from './data';
import { DEMO_OTP, PHONE_LENGTH } from '@/lib/constants';

let currentOrders = [...mockOrders];

export const handlers = [
  // 1. Request OTP
  http.post('*/auth/otp/request', async ({ request }) => {
    await delay(350);
    const body = (await request.json()) as { phone?: string };
    const phone = body?.phone?.trim() || '';

    if (phone.length !== PHONE_LENGTH) {
      return HttpResponse.json(
        { message: `Phone number must be exactly ${PHONE_LENGTH} digits.` },
        { status: 422 }
      );
    }

    return HttpResponse.json({ ok: true });
  }),

  // 2. Verify OTP
  http.post('*/auth/otp/verify', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { phone?: string; code?: string };
    const { phone, code } = body;

    if (code !== DEMO_OTP) {
      return HttpResponse.json(
        { message: `Invalid code. Please enter the demo code (${DEMO_OTP}).` },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      token: 'fastor-mock-jwt-token-xyz',
      user: {
        id: 'user-karan-1',
        name: 'Karan',
        phone: phone || '9876543210',
      },
    });
  }),

  // 3. Get Items
  http.get('*/items', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const bestSeller = url.searchParams.get('bestSeller');

    if (bestSeller === 'true') {
      return HttpResponse.json(mockItems.filter((i) => i.isBestSeller));
    }

    return HttpResponse.json(mockItems);
  }),

  // 4. Get Item by ID
  http.get('*/items/:id', async ({ params }) => {
    await delay(250);
    const { id } = params;
    const item = mockItems.find((i) => i.id === id);

    if (!item) {
      return HttpResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    return HttpResponse.json(item);
  }),

  // 5. Get Offers
  http.get('*/offers', async () => {
    await delay(200);
    return HttpResponse.json(mockOffers);
  }),

  // 6. Get Orders
  http.get('*/orders', async () => {
    await delay(250);
    return HttpResponse.json(currentOrders);
  }),

  // 7. Cancel Order
  http.post('*/orders/:id/cancel', async ({ params }) => {
    await delay(350);
    const { id } = params;
    const orderIndex = currentOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    currentOrders[orderIndex] = {
      ...currentOrders[orderIndex],
      status: 'cancelled',
    };

    return HttpResponse.json(currentOrders[orderIndex]);
  }),
];
