export type CategoryId = 'groceries' | 'transport' | 'entertainment' | 'rent' | 'salary' | 'freelance' | 'investment' | 'other_income';

export interface Category {
  id: CategoryId;
  name: string;
  amount: number;
  color: string;
  bgHex: string;
  icon: string;
}

export interface Transaction {
  id: string;
  title: string;
  categoryId: CategoryId;
  categoryName: string;
  date: string; // e.g., "Sep 14, 2025"
  rawDate: string; // ISO date format for sorting/charts
  amount: number; // positive or negative
  paymentMethod: string; // e.g. "Card •••• 1234", "Paid with Visa"
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
