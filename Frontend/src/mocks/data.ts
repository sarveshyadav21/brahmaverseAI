import type { Item, Offer, Order } from '@/types';

export const mockItems: Item[] = [
  {
    id: 'pizza-lorem',
    name: 'Lorem ipsum dolor sit amet',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
    price: 14.0,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
    isBestSeller: true,
    portions: [
      { id: 'personal', name: 'Personal (4 Slices)', price: 0.0 },
      { id: 'medium', name: 'Medium (8 Slices)', price: 3.0 },
      { id: 'familiar', name: 'Familiar (10 Slices)', price: 6.0 },
      { id: 'jumbo', name: 'Jumbo (12 Slices)', price: 10.0 },
    ],
  },
  {
    id: 'sushi-supreme',
    name: 'Sushi Supreme',
    description: 'Fresh salmon, avocado, seasoned sushi rice with authentic Japanese wasabi and pickled ginger.',
    price: 103.0,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
    isBestSeller: true,
    portions: [
      { id: 'standard', name: 'Standard (6 Pieces)', price: 0.0 },
      { id: 'large', name: 'Large (12 Pieces)', price: 40.0 },
    ],
  },
  {
    id: 'hyderabadi-biryani',
    name: 'Hyderabadi Biryani',
    description: 'Slow-cooked aromatic basmati rice layered with marinated tender chicken and fragrant whole spices.',
    price: 50.0,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    isBestSeller: true,
    portions: [
      { id: 'half', name: 'Half Handi', price: 0.0 },
      { id: 'full', name: 'Full Handi', price: 25.0 },
    ],
  },
  {
    id: 'italian-lasagna',
    name: 'Italian Lasagna',
    description: 'Baked sheets of fresh pasta layered with slow-simmered bolognese sauce and creamy béchamel.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=600&q=80',
    isBestSeller: true,
    portions: [
      { id: 'single', name: 'Regular Portion', price: 0.0 },
      { id: 'double', name: 'Large Portion', price: 5.0 },
    ],
  },
  {
    id: 'berry-cupcake',
    name: 'Berry Cupcake',
    description: 'Moist vanilla sponge topped with fresh raspberry buttercream frosting and wild blueberries.',
    price: 8.2,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    isBestSeller: true,
    portions: [
      { id: 'one', name: 'Single Cupcake', price: 0.0 },
      { id: 'four', name: 'Box of 4', price: 18.0 },
    ],
  },
];

export const mockOffers: Offer[] = [
  {
    id: 'offer-1',
    title: 'Experience our delicious new dish',
    subtitle: 'Limited time chef special',
    discount: '30% OFF',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'offer-2',
    title: 'Weekend Biryani Feast',
    subtitle: 'Free beverage on every handi',
    discount: '20% OFF',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-101',
    itemName: 'Strawberry Shake',
    itemImage: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=400&q=80',
    date: '29 Nov, 01:20 pm',
    price: 20.0,
    itemCount: 2,
    status: 'active',
  },
  {
    id: 'ord-102',
    itemName: 'Chicken Burger',
    itemImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    date: '17 Oct, 01:20 pm',
    price: 20.0,
    itemCount: 1,
    status: 'active',
  },
];
