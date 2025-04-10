export interface User {
  id: number;
  email: string;
  name: string;
  shopName: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactInfo?: string | null;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface Product {
  id: number;
  productId: string;
  name: string;
  sku: string;
  purchaseRate: number;
  sellingPrice: number;
  stockQuantity: number;
  supplierId: number;
  supplier?: Supplier;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  sellingPrice: number;
  discount: number;
  createdAt: string;
  user?: User;
  product?: Product;
}

export interface TransactionSummary {
  totalSales: number;
  totalTransactions: number;
  topProducts: {
    productId: number;
    productName: string;
    quantity: number;
    sellingPrice: number;
  }[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
} 