export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  amount: number;
  color: string;
  bgHex: string;
  icon: string;
  budget?: number; // Monthly budget limit
  type?: 'expense' | 'income';
}

export interface Transaction {
  id: string;
  title: string;
  categoryId: CategoryId;
  categoryName: string;
  date: string; // e.g., "Sep 14, 2025"
  rawDate: string; // ISO date format for sorting/charts (YYYY-MM-DD)
  amount: number; // positive for income, negative for expense
  paymentMethod: string; // e.g. "BCA", "Mandiri", "GoPay", "Cash", "Card"
  iconUrl?: string;
  notes?: string;
}

export type ViewTab = 'dashboard' | 'wallet' | 'analysis' | 'profile';

export interface ChartPoint {
  dateLabel: string;
  dayNum: number;
  amount: number;
  fullDate: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export type AuthSessionStatus = 'pending' | 'verified' | 'expired';

export interface AuthSession {
  sessionId: string;
  code: string;
  botNumber: string;
  waLink: string;
  status: AuthSessionStatus;
  expiresAt: number;
  user?: User;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  session?: AuthSession;
  user?: User;
  token?: string;
  error?: string;
}
