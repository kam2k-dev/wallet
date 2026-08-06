/**
 * Frontend API client for the backend data endpoints.
 * The backend serves from the dummy JSON DB (dev) or Supabase (prod).
 */
import { Transaction, Category } from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Request failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getTransactions(): Promise<Transaction[]> {
    return request<Transaction[]>('/api/transactions');
  },

  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/api/categories');
  },

  async addTransaction(tx: Transaction): Promise<Transaction> {
    return request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  },

  async updateTransaction(tx: Transaction): Promise<Transaction> {
    return request<Transaction>(`/api/transactions/${tx.id}`, {
      method: 'PUT',
      body: JSON.stringify(tx),
    });
  },

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  async addCategory(cat: Category): Promise<Category> {
    return request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    });
  },

  async updateCategories(categories: Category[]): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/categories', {
      method: 'PUT',
      body: JSON.stringify(categories),
    });
  },
};
