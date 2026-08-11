/**
 * Frontend API client for the backend data endpoints.
 * The backend serves from the dummy JSON DB (dev) or Supabase (prod).
 */
import { Transaction, Category, AuthSession, User } from '../types';

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
  // ─── WhatsApp Reverse Auth ──────────────────────────────────────────────
  async initiateWaAuth(phoneHint?: string): Promise<{ success: boolean; session: AuthSession }> {
    return request<{ success: boolean; session: AuthSession }>('/api/auth/wa/initiate', {
      method: 'POST',
      body: JSON.stringify({ phoneHint }),
    });
  },

  async checkWaAuthStatus(sessionId: string): Promise<{
    success: boolean;
    status: 'pending' | 'verified' | 'expired';
    session?: AuthSession;
    user?: User;
    token?: string;
  }> {
    return request(`/api/auth/wa/status/${sessionId}`);
  },

  async mockVerifyWaAuth(sessionId: string, phone?: string): Promise<{
    success: boolean;
    session?: AuthSession;
    user?: User;
    token?: string;
  }> {
    return request('/api/auth/wa/mock-verify', {
      method: 'POST',
      body: JSON.stringify({ sessionId, phone }),
    });
  },

  // ─── Data Endpoints ─────────────────────────────────────────────────────
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
