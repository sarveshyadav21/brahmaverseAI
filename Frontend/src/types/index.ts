export interface Portion {
  id: string;
  name: string;
  price: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isBestSeller?: boolean;
  portions: Portion[];
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  image: string;
}

export type OrderStatus = 'active' | 'cancelled' | 'delivered';

export interface Order {
  id: string;
  itemName: string;
  itemImage: string;
  date: string;
  price: number;
  itemCount: number;
  status: OrderStatus;
}

export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CartLine {
  itemId: string;
  portionId: string;
  quantity: number;
}
