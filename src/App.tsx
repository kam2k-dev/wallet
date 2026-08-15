/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ViewTab, CategoryId, Transaction, Category, User } from './types';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from './data/mockData';
import { api } from './api/client';
import { CurrencyCode } from './utils/currency';
import { fetchLiveRates, convertCurrency, FALLBACK_RATES } from './utils/exchangeRate';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { SpendAnalysisView } from './components/SpendAnalysisView';
import { WalletDetailsView } from './components/WalletDetailsView';
import { ProfileView } from './components/ProfileView';
import { LoginPage } from './components/LoginPage';
import { AddTransactionModal } from './components/AddTransactionModal';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { AddCategoryModal } from './components/AddCategoryModal';

interface ToastState {
  message: string;
  type?: 'success' | 'info' | 'error' | 'delete';
}

export default function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard'); // Default to Dashboard (home) screen
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId>('groceries');
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Handle Login Success
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
    showToast(`Selamat datang, ${user.name}!`, 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setCurrentTab('dashboard');
    showToast('Anda telah keluar dari akun.', 'info');
  };

  // Apply dark mode class to html element
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      html.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Fetch live exchange rates on mount
  useEffect(() => {
    fetchLiveRates().then((liveRates) => {
      setRates(liveRates);
    });
  }, []);

  // Load data from backend (dummy JSON in dev, PostgreSQL in prod)
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getCategories(), api.getTransactions()])
      .then(([cats, txs]) => {
        if (cancelled) return;
        if (cats.length) setCategories(cats);
        if (txs.length) setTransactions(txs);
      })
      .catch((err) => {
        console.warn('Failed to load data from API, using mock data:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handler to change currency and convert all stored values according to real-time rates
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    if (newCurrency === currency) return;

    const oldCurrency = currency;

    // Convert transactions
    setTransactions((prevTxs) =>
      prevTxs.map((tx) => ({
        ...tx,
        amount: convertCurrency(tx.amount, oldCurrency, newCurrency, rates),
      }))
    );

    // Convert categories
    setCategories((prevCats) =>
      prevCats.map((cat) => ({
        ...cat,
        amount: convertCurrency(cat.amount, oldCurrency, newCurrency, rates),
      }))
    );

    setCurrency(newCurrency);
    showToast(`Currency updated to ${newCurrency}`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'delete' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3000);
  };

  // Recalculate spending totals & balance accurately from transactions
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const totalBalance = useMemo(() => {
    return totalIncome - totalExpense;
  }, [totalIncome, totalExpense]);

  const totalSpending = totalExpense;

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || categories[0];
  }, [categories, selectedCategoryId]);

  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategoryId(catId);
    setCurrentTab('wallet');
  };

  const handleAddTransaction = async (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };

    // Persist to backend (dummy JSON in dev, PostgreSQL in prod)
    try {
      await api.addTransaction(newTx);
    } catch (err) {
      console.warn('Failed to persist transaction to API:', err);
    }

    setTransactions((prev) => [newTx, ...prev]);

    // Update corresponding category total
    setCategories((prevCats) =>
      prevCats.map((cat) => {
        if (cat.id === newTx.categoryId) {
          return {
            ...cat,
            amount: cat.amount + Math.abs(newTx.amount),
          };
        }
        return cat;
      })
    );

    showToast(`Added "${newTx.title}" successfully!`, 'success');
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    const oldTx = transactions.find((t) => t.id === updatedTx.id);
    if (!oldTx) return;

    try {
      await api.updateTransaction(updatedTx);
    } catch (err) {
      console.warn('Failed to update transaction in API:', err);
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );

    // Recalculate category amounts
    setCategories((prevCats) =>
      prevCats.map((cat) => {
        let amt = cat.amount;
        if (cat.id === oldTx.categoryId) {
          amt = Math.max(0, amt - Math.abs(oldTx.amount));
        }
        if (cat.id === updatedTx.categoryId) {
          amt = amt + Math.abs(updatedTx.amount);
        }
        return { ...cat, amount: amt };
      })
    );

    showToast(`Updated "${updatedTx.title}"`, 'info');
  };

  const handleDeleteTransaction = async (id: string) => {
    const txToDelete = transactions.find((t) => t.id === id);
    if (!txToDelete) return;

    // Persist deletion to backend
    try {
      await api.deleteTransaction(id);
    } catch (err) {
      console.warn('Failed to delete transaction from API:', err);
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    setCategories((prevCats) =>
      prevCats.map((cat) => {
        if (cat.id === txToDelete.categoryId) {
          return {
            ...cat,
            amount: Math.max(0, cat.amount - Math.abs(txToDelete.amount)),
          };
        }
        return cat;
      })
    );

    showToast(`Deleted "${txToDelete.title}"`, 'delete');
  };

  const handleAddCategory = async (newCat: Category) => {
    try {
      await api.addCategory(newCat);
    } catch (err) {
      console.warn('Failed to add category to API:', err);
    }
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.name}" created!`, 'success');
  };

  const handleDeleteCategory = async (id: CategoryId) => {
    const categoryToDelete = categories.find((c) => c.id === id);
    if (!categoryToDelete) return;

    if (window.confirm(`Are you sure you want to delete category "${categoryToDelete.name}"? All related transactions will remain but may lose their category styling.`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast(`Deleted category "${categoryToDelete.name}"`, 'delete');
    }
  };

  const handleEditCategory = async (updatedCat: Category) => {
    // Persist to backend (dummy JSON in dev, PostgreSQL in prod)
    try {
      // In a real app we'd have api.updateCategory(updatedCat)
      // await api.updateCategory(updatedCat);
    } catch (err) {
      console.warn('Failed to update category to API:', err);
    }

    setCategories((prevCats) =>
      prevCats.map((cat) => (cat.id === updatedCat.id ? updatedCat : cat))
    );

    showToast(`Category "${updatedCat.name}" updated!`, 'success');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }
    const headers = ['ID', 'Title', 'Category', 'Amount', 'Type', 'Payment Method', 'Date', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.categoryName}"`,
      t.amount,
      t.amount < 0 ? 'Expense' : 'Income',
      `"${t.paymentMethod}"`,
      t.date,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dompetku_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Transactions exported to CSV!', 'success');
  };

  // Export to JSON
  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      currency,
      categories,
      transactions,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `dompetku_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Backup JSON downloaded!', 'success');
  };

  const handleBackHeader = () => {
    if (currentTab === 'wallet' || currentTab === 'analysis' || currentTab === 'profile') {
      setCurrentTab('dashboard');
    }
  };

  // Default Guest User for bypass
  const handleBypassLogin = () => {
    const guestUser: User = {
      id: 'guest-user',
      email: 'guest@dompetku.local',
      name: 'Pengguna Tamu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };
    handleLoginSuccess(guestUser, 'guest-token-bypass');
  };

  // If user is not logged in, render the Google Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBypassLogin={handleBypassLogin}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary relative selection:bg-[#2170e4]/20 flex flex-col md:flex-row">
      {/* 6. Sidebar Navigation for Tablet & Desktop Layout */}
      <aside className="hidden md:flex flex-col w-64 bg-bg-secondary border-r border-border-color sticky top-0 h-screen shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
        <div className="p-6 pb-4 border-b border-border-color/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2170e4] to-[#0051a8] flex items-center justify-center text-white shadow-lg shadow-[#2170e4]/25">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M27 8H7a1 1 0 0 1 0-2h17a1 1 0 1 0 0-2H7a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h20a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2m-4.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-[18px] tracking-tight text-text-primary leading-tight">DompetKu</h1>
            <p className="text-[11px] font-semibold text-text-secondary">Smart Finance</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {[
            { id: 'dashboard' as ViewTab, label: 'Dashboard', icon: 'dashboard' },
            { id: 'wallet' as ViewTab, label: 'Kategori Wallet', icon: 'account_balance_wallet' },
            { id: 'analysis' as ViewTab, label: 'Analisis & Laporan', icon: 'pie_chart' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left font-semibold text-[14px] ${
                currentTab === tab.id
                  ? 'bg-[#2170e4]/10 text-[#2170e4] shadow-sm'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${currentTab === tab.id ? 'fill-1' : ''}`}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          
          <div className="pt-4 mt-2 border-t border-border-color/50">
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-bold text-[14px] text-white bg-gradient-to-r from-[#2170e4] to-[#0051a8] hover:shadow-lg hover:shadow-[#2170e4]/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Tambah Transaksi
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-border-color/50">
          <button
            onClick={() => setCurrentTab('profile')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 text-left ${
              currentTab === 'profile' ? 'bg-[#2170e4]/10 border border-[#2170e4]/20' : 'hover:bg-bg-tertiary border border-transparent'
            }`}
          >
            <img src={currentUser.avatar} alt="Profile" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[13px] text-text-primary truncate">{currentUser.name}</p>
              <p className="text-[11px] font-medium text-text-secondary truncate">{currentUser.email}</p>
            </div>
            <span className="material-symbols-outlined text-[18px] text-text-secondary">chevron_right</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden md:max-w-4xl lg:max-w-5xl mx-auto">
        {/* Modern Floating Toast Notification */}
        {toast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border pointer-events-auto ${
                toast.type === 'success'
                  ? 'bg-[#27AE60]/95 text-white border-[#27AE60]/30 shadow-[#27AE60]/20'
                  : toast.type === 'delete'
                  ? 'bg-[#ba1a1a]/95 text-white border-[#ba1a1a]/30 shadow-[#ba1a1a]/20'
                  : toast.type === 'error'
                  ? 'bg-[#ba1a1a]/95 text-white border-[#ba1a1a]/30 shadow-[#ba1a1a]/20'
                  : 'bg-[#0058be]/95 text-white border-[#0058be]/30 shadow-[#0058be]/20'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">
                  {toast.type === 'success'
                    ? 'check_circle'
                    : toast.type === 'delete'
                    ? 'delete'
                    : toast.type === 'error'
                    ? 'error'
                    : 'info'}
                </span>
              </div>
              <p className="text-[13px] font-medium leading-tight flex-1">{toast.message}</p>
              <button
                onClick={() => setToast(null)}
                className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Header - Mobile Only */}
        <div className="md:hidden">
          <Header
            currentTab={currentTab}
            categoryTitle={selectedCategory.name}
            onBack={handleBackHeader}
            user={currentUser}
            onProfileClick={() => setCurrentTab('profile')}
          />
        </div>

        {/* Main View Area */}
        <div className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              categories={categories}
              transactions={transactions}
              totalBalance={totalBalance}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              currency={currency}
              onSelectCategory={handleSelectCategory}
              onSelectTransaction={setSelectedTransaction}
              onSeeAllTransactions={() => setCurrentTab('analysis')}
              onAddCategory={() => setIsAddCategoryModalOpen(true)}
              onDeleteCategory={handleDeleteCategory}
              onEditCategory={handleEditCategory}
            />
          )}

          {currentTab === 'analysis' && (
            <SpendAnalysisView
              categories={categories}
              transactions={transactions}
              totalSpending={totalSpending}
              currency={currency}
              onSelectCategory={handleSelectCategory}
              onSelectTransaction={setSelectedTransaction}
            />
          )}

          {currentTab === 'wallet' && (
            <WalletDetailsView
              category={selectedCategory}
              categories={categories}
              transactions={transactions}
              currency={currency}
              onSelectCategory={setSelectedCategoryId}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              onSelectTransaction={setSelectedTransaction}
              onQuickAction={(actionName) => showToast(`Action: ${actionName}`)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView 
              user={currentUser}
              onLogout={handleLogout}
              currency={currency} 
              onCurrencyChange={handleCurrencyChange} 
              rates={rates} 
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
            />
          )}
        </div>

        {/* Bottom Floating Navigation Bar - Mobile Only */}
        <div className="md:hidden">
          <BottomNav
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      <AddTransactionModal
        categories={categories}
        isOpen={isAddModalOpen}
        currency={currency}
        initialData={editingTransaction}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onAddTransaction={handleAddTransaction}
        onUpdateTransaction={handleUpdateTransaction}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        currency={currency}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
      />

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selectedTransaction}
        categories={categories}
        currency={currency}
        onClose={() => setSelectedTransaction(null)}
        onEdit={(tx) => {
          setSelectedTransaction(null);
          setEditingTransaction(tx);
          setIsAddModalOpen(true);
        }}
        onDelete={(id) => {
          handleDeleteTransaction(id);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
}
