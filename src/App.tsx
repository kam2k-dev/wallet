/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { ViewTab, CategoryId, Transaction, Category } from './types';
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
import { AddTransactionModal } from './components/AddTransactionModal';
import { TransactionDetailsModal } from './components/TransactionDetailsModal';
import { AddCategoryModal } from './components/AddCategoryModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard'); // Default to Dashboard (home) screen
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId>('groceries');
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  // Load data from backend (dummy JSON in dev, Supabase in prod)
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
    showToast(`Currency updated to ${newCurrency} (Rate applied)`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
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

    // Persist to backend (dummy JSON in dev, Supabase in prod)
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

    showToast(`Added "${newTx.title}" successfully!`);
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

    showToast(`Updated "${updatedTx.title}"`);
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

    showToast(`Deleted "${txToDelete.title}"`);
  };

  const handleAddCategory = async (newCat: Category) => {
    try {
      await api.addCategory(newCat);
    } catch (err) {
      console.warn('Failed to add category to API:', err);
    }
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.name}" created!`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transactions to export');
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
    showToast('Transactions exported to CSV!');
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
    showToast('Backup JSON downloaded!');
  };

  const handleBackHeader = () => {
    if (currentTab === 'wallet' || currentTab === 'analysis' || currentTab === 'profile') {
      setCurrentTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary relative selection:bg-[#2170e4]/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#141b2b] text-white px-5 py-2.5 rounded-full text-[13px] font-medium shadow-xl animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        categoryTitle={selectedCategory.name}
        onBack={handleBackHeader}
      />

      {/* Main View Area */}
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
          transactions={transactions}
          currency={currency}
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
          currency={currency} 
          onCurrencyChange={handleCurrencyChange} 
          rates={rates} 
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
        />
      )}

      {/* Bottom Floating Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
      />

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
        onDelete={handleDeleteTransaction}
        onEdit={(tx) => {
          setEditingTransaction(tx);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
}
