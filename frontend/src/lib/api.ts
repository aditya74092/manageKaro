import axios from 'axios';
import { AuthResponse, User, Product, Supplier, Transaction, TransactionSummary } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const auth = {
  register: (data: { email: string; password: string; name: string; shopName: string; contactInfo?: string }) =>
    api.post<AuthResponse>('/users/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/users/login', data),
  getProfile: () => api.get<User>('/users/profile'),
};

// Products API
export const products = {
  getAll: () => api.get<Product[]>('/products'),
  get: (id: number) => api.get<Product>(`/products/${id}`),
  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Product>('/products', data),
  update: (id: number, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  updateStock: (id: number, stockQuantity: number) =>
    api.patch<Product>(`/products/${id}/stock`, { stockQuantity }),
};

// Suppliers API
export const suppliers = {
  getAll: () => api.get<Supplier[]>('/suppliers'),
  get: (id: number) => api.get<Supplier>(`/suppliers/${id}`),
  create: (data: Pick<Supplier, 'name' | 'contactInfo'>) =>
    api.post<Supplier>('/suppliers', data),
  update: (id: number, data: Partial<Supplier>) =>
    api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

// Transactions API
export const transactions = {
  getAll: () => api.get<Transaction[]>('/transactions'),
  get: (id: number) => api.get<Transaction>(`/transactions/${id}`),
  create: (data: { productId: number; quantity: number; discount?: number }) =>
    api.post<Transaction>('/transactions', data),
  getUserTransactions: () => api.get<Transaction[]>('/transactions/user'),
  getSummary: () => api.get<TransactionSummary>('/transactions/summary'),
}; 