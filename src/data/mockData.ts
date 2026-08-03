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
  {
    id: 'salary',
    name: 'Salary',
    amount: 0,
    color: '#27AE60',
    bgHex: '#2ecc71',
    icon: 'payments',
  },
  {
    id: 'freelance',
    name: 'Freelance',
    amount: 0,
    color: '#00bcd4',
    bgHex: '#0097a7',
    icon: 'work',
  },
  {
    id: 'investment',
    name: 'Investment',
    amount: 0,
    color: '#8e44ad',
    bgHex: '#9b59b6',
    icon: 'trending_up',
  },
  {
    id: 'other_income',
    name: 'Other Income',
    amount: 0,
    color: '#16a085',
    bgHex: '#1abc9c',
    icon: 'savings',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
