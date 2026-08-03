import { Category, Transaction } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'groceries',
    name: 'Groceries',
    amount: 0,
    color: '#9466ff',
    bgHex: '#9c27b0',
    icon: 'shopping_bag',
  },
  {
    id: 'transport',
    name: 'Transport',
    amount: 0,
    color: '#2170e4',
    bgHex: '#2196f3',
    icon: 'directions_car',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    amount: 0,
    color: '#27AE60',
    bgHex: '#4caf50',
    icon: 'event',
  },
  {
    id: 'rent',
    name: 'Rent & Utilities',
    amount: 0,
    color: '#F39C12',
    bgHex: '#ff9800',
    icon: 'home',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
