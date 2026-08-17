import React, { useState, useMemo } from 'react';
import { Category, Transaction, CategoryId } from '../types';
import { CurrencyCode, formatCurrency } from '../utils/currency';
import { TransactionItem } from './ui/TransactionItem';
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  CheckIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { ChartPieIcon as ChartPieOutline } from '@heroicons/react/24/outline';

interface SpendAnalysisViewProps {
  categories: Category[];
  transactions: Transaction[];
  totalSpending: number;
  currency: CurrencyCode;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectTransaction: (transaction: Transaction) => void;
}

type TimeFilter = 'all' | 'this_month' | 'last_month' | 'this_year';
type TypeFilter = 'all' | 'expense' | 'income';

export const SpendAnalysisView: React.FC<SpendAnalysisViewProps> = ({
  categories,
  transactions,
  totalSpending,
  currency,
  onSelectCategory,
  onSelectTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPieDetail, setShowPieDetail] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);

  const formatAmount = (num: number) => formatCurrency(num, currency);

  // Filter transactions by time and type
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    return transactions.filter((tx) => {
      // Type filter
      if (typeFilter === 'expense' && tx.amount >= 0) return false;
      if (typeFilter === 'income' && tx.amount < 0) return false;

      // Time filter
      if (tx.rawDate) {
        const txDate = new Date(tx.rawDate);
        if (timeFilter === 'this_month') {
          if (txDate.getFullYear() !== currentYear || txDate.getMonth() !== currentMonth) {
            return false;
          }
        } else if (timeFilter === 'last_month') {
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          if (txDate.getFullYear() !== lastMonthYear || txDate.getMonth() !== lastMonth) {
            return false;
          }
        } else if (timeFilter === 'this_year') {
          if (txDate.getFullYear() !== currentYear) {
            return false;
          }
        }
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.categoryName.toLowerCase().includes(q) ||
        tx.date.toLowerCase().includes(q) ||
        tx.paymentMethod.toLowerCase().includes(q)
      );
    });
  }, [transactions, timeFilter, typeFilter, searchQuery]);

  // Calculate dynamic spending based on filtered transactions
  const dynamicSpending = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [filteredTransactions]);

  const dynamicIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  // Calculate category breakdown from filtered transactions
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((tx) => {
      if (typeFilter === 'income') {
        if (tx.amount > 0) {
          map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
        }
      } else if (typeFilter === 'expense') {
        if (tx.amount < 0) {
          map[tx.categoryId] = (map[tx.categoryId] || 0) + Math.abs(tx.amount);
        }
      } else {
        // 'all': include both income and expense amounts
        map[tx.categoryId] = (map[tx.categoryId] || 0) + Math.abs(tx.amount);
      }
    });
    return categories.map((cat) => ({
      ...cat,
      filteredAmount: map[cat.id] || 0,
    }));
  }, [categories, filteredTransactions, typeFilter]);

  // Calculate percentages for segmented bar
  const totalRelevantAmount = typeFilter === 'income' ? dynamicIncome : (typeFilter === 'expense' ? dynamicSpending : (dynamicSpending + dynamicIncome));

  const getPercentage = (amount: number) => {
    if (!totalRelevantAmount || totalRelevantAmount <= 0) return 0;
    return Math.round((amount / totalRelevantAmount) * 100);
  };

  // Top category insight
  const topCategory = useMemo(() => {
    const sorted = [...categoryBreakdown].sort((a, b) => b.filteredAmount - a.filteredAmount);
    return sorted[0]?.filteredAmount > 0 ? sorted[0] : null;
  }, [categoryBreakdown]);

  return (
    <main className="max-w-md mx-auto px-5 pt-4 space-y-5 pb-28">
      {/* Time & Type Filter - Single Row */}
      <section className="flex items-center justify-between gap-2 relative z-30">
        {/* Segmented Control: All / Expense / Income */}
        <div className="flex bg-bg-secondary p-1 rounded-2xl border border-border-color flex-1">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'expense', label: 'Expense' },
              { id: 'income', label: 'Income' },
            ] as const
          ).map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTypeFilter(tf.id)}
              className={`flex-1 py-1.5 text-[12px] font-semibold rounded-xl transition-all ${
                typeFilter === tf.id
                  ? tf.id === 'expense'
                    ? 'bg-[#ba1a1a] text-white shadow-sm'
                    : tf.id === 'income'
                    ? 'bg-[#27AE60] text-white shadow-sm'
                    : 'bg-[#0058be] text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Custom Floating Time Filter Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsTimeMenuOpen(!isTimeMenuOpen)}
            className={`flex items-center gap-1.5 bg-bg-secondary border text-text-primary text-[12px] font-medium h-[38px] px-3 rounded-2xl shadow-sm transition-all ${
              isTimeMenuOpen
                ? 'border-brand-primary ring-2 ring-brand-primary/20'
                : 'border-border-color hover:bg-bg-tertiary'
            }`}
          >
            <CalendarDaysIcon className="w-4 h-4 text-brand-primary" />
            <span>
              {timeFilter === 'all'
                ? 'All Time'
                : timeFilter === 'this_month'
                ? 'This Month'
                : timeFilter === 'last_month'
                ? 'Last Month'
                : 'This Year'}
            </span>
            <ChevronDownIcon className={`w-3.5 h-3.5 text-text-secondary transition-transform duration-200 ${
              isTimeMenuOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Floating Dropdown Menu */}
          {isTimeMenuOpen && (
            <>
              {/* Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsTimeMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-bg-secondary rounded-2xl border border-border-color shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                {(
                  [
                    { id: 'all', label: 'All Time' },
                    { id: 'this_month', label: 'This Month' },
                    { id: 'last_month', label: 'Last Month' },
                    { id: 'this_year', label: 'This Year' },
                  ] as const
                ).map((item) => {
                  const isSelected = timeFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTimeFilter(item.id);
                        setIsTimeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium transition-colors ${
                        isSelected
                          ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                          : 'text-text-primary hover:bg-bg-tertiary'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && (
                        <CheckIcon className="w-4 h-4 text-brand-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Total Spending / Income Section */}
      <section className="bg-bg-secondary p-5 rounded-3xl border border-border-color shadow-sm space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[13px] text-text-secondary">
              {typeFilter === 'income'
                ? 'Total Income'
                : typeFilter === 'expense'
                ? 'Total Spending'
                : 'Net Flow (Income - Expense)'}
            </p>
            <h2 className="font-bold text-[26px] leading-[32px] text-text-primary mt-0.5">
              {typeFilter === 'income'
                ? formatCurrency(dynamicIncome, currency)
                : typeFilter === 'expense'
                ? formatCurrency(dynamicSpending, currency)
                : formatCurrency(dynamicIncome - dynamicSpending, currency)}
            </h2>
            {typeFilter === 'all' && (
              <div className="flex gap-3 mt-1 text-[12px]">
                <span className="text-[#27AE60] font-medium">
                  +{formatCurrency(dynamicIncome, currency)}
                </span>
                <span className="text-[#ba1a1a] font-medium">
                  -{formatCurrency(dynamicSpending, currency)}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowPieDetail(!showPieDetail)}
            aria-label="Toggle Pie Chart"
            className="p-2.5 rounded-full bg-[#e1e8fd] dark:bg-black/20 text-text-secondary hover:bg-[#dce2f7] active:scale-95 transition-all shadow-sm flex items-center justify-center"
          >
            {showPieDetail ? (
              <ChartPieIcon className="w-5 h-5 text-brand-primary" />
            ) : (
              <ChartPieOutline className="w-5 h-5 text-text-secondary" />
            )}
          </button>
        </div>

        {/* Segmented Progress Bar */}
        {totalRelevantAmount > 0 && (
          <div className="h-3.5 w-full flex rounded-full overflow-hidden bg-black/5 dark:bg-white/5 p-0.5">
            {categoryBreakdown
              .filter((cat) => cat.filteredAmount > 0)
              .map((cat, idx) => {
                const pct = getPercentage(cat.filteredAmount);
                return (
                  <div
                    key={cat.id}
                    className={`h-full transition-all duration-300 ${idx > 0 ? 'ml-[2px]' : ''}`}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color,
                    }}
                    title={`${cat.name}: ${pct}%`}
                  />
                );
              })}
          </div>
        )}

        {/* Smart Insight */}
        {topCategory && (
          <div className="flex items-center gap-2 p-2.5 bg-bg-primary rounded-2xl text-[12px] text-text-secondary border border-border-color">
            <ArrowTrendingUpIcon className="w-4 h-4 text-brand-primary shrink-0" />
            <span>
              Highest {typeFilter === 'income' ? 'income' : 'activity'} in{' '}
              <strong className="text-text-primary">{topCategory.name}</strong> (
              {getPercentage(topCategory.filteredAmount)}% of total)
            </span>
          </div>
        )}

        {/* Optional Pie Detail Breakdown */}
        {showPieDetail && (
          <div className="bg-bg-primary p-3.5 rounded-2xl border border-border-color shadow-sm space-y-2 animate-in fade-in">
            <h4 className="text-[12px] font-semibold text-text-primary">Percentage Distribution</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {categoryBreakdown
                .filter((cat) => cat.filteredAmount > 0)
                .map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-text-secondary truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="font-semibold text-text-primary shrink-0">
                      {getPercentage(cat.filteredAmount)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* Search Bar */}
      <section className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#77767b]">
          <MagnifyingGlassIcon className="w-4 h-4 text-text-secondary" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for any transaction"
          className="w-full h-11 pl-11 pr-4 bg-bg-secondary rounded-full border border-border-color focus:ring-2 focus:ring-brand-primary text-[13px] placeholder:text-[#77767b] outline-none text-text-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77767b] hover:text-text-primary"
          >
            <XCircleIcon className="w-4 h-4" />
          </button>
        )}
      </section>

      {/* Transaction List */}
      <section className="space-y-3">
        <h3 className="font-semibold text-[15px] leading-[22px] text-text-primary">
          Transactions ({filteredTransactions.length})
        </h3>
        <div className="space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-[13px] bg-bg-secondary rounded-2xl border border-border-color">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  category={cat}
                  currency={currency}
                  onClick={onSelectTransaction}
                  subtitleMode="payment-date"
                />
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};
