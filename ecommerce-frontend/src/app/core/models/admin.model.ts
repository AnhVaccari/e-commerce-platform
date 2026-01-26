// Admin-specific models for order management, user management
export type { Product, Category } from '../../interfaces/product.interface';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  user: User;
}
