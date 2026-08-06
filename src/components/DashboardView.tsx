import React, { useState } from 'react';
import { Category, Transaction, CategoryId } from '../types';
import { CurrencyCode, formatCurrency } from '../utils/currency';

interface DashboardViewProps {
  categories: Category[];
  transactions: Transaction[];
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  currency: CurrencyCode;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onSeeAllTransactions: () => void;
  onAddCategory?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  categories,
  transactions,
  totalBalance,
  totalIncome,
  totalExpense,
  currency,
  onSelectCategory,
  onSelectTransaction,
  onSeeAllTransactions,
  onAddCategory,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<Set<CategoryId>>(() => {
    const saved = localStorage.getItem('hiddenCategories');
    // Default hidden categories for new users (hide income categories by default)
    const defaultHidden: CategoryId[] = ['salary', 'freelance', 'investment', 'other_income'];
    return saved ? new Set(JSON.parse(saved)) : new Set(defaultHidden);
  });

  const toggleCategoryVisibility = (id: CategoryId, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('hiddenCategories', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Take latest 5 transactions
  const latestTransactions = transactions.slice(0, 5);

  const formatAmount = (num: number) => formatCurrency(num, currency);

  const visibleCategories = isEditMode 
    ? categories 
    : categories.filter(cat => !hiddenCategories.has(cat.id));

  return (
    <main className="px-5 space-y-5 pt-2 pb-28 max-w-md mx-auto">
      {/* Main Balance Section */}
      <section className="bg-bg-secondary p-5 rounded-3xl border border-border-color shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-[13px] font-medium">Total Balance</p>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-text-secondary hover:text-text-primary p-1 transition-colors"
            title="Toggle balance visibility"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showBalance ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="font-bold text-[28px] leading-[34px] text-text-primary tracking-tight">
            {showBalance ? formatCurrency(totalBalance, currency) : '••••••••'}
          </h1>
        </div>

        {/* Income & Expense Summary Pills */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-color">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#27AE60]/10 text-[#27AE60] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-text-secondary">Income</p>
              <p className="text-[13px] font-bold text-[#27AE60] truncate">
                {showBalance ? formatCurrency(totalIncome, currency) : '••••'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-text-secondary">Expense</p>
              <p className="text-[13px] font-bold text-[#ba1a1a] truncate">
                {showBalance ? formatCurrency(totalExpense, currency) : '••••'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[16px] leading-[24px] text-text-primary">Categories</h2>
          <div className="flex items-center gap-3">
            {onAddCategory && (
              <button
                onClick={onAddCategory}
                className="text-[#0058be] text-[12px] font-medium hover:underline flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                New
              </button>
            )}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="text-[#0058be] text-[12px] font-medium hover:underline"
            >
              {isEditMode ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {visibleCategories.map((cat) => {
            const isHidden = hiddenCategories.has(cat.id);
            const budgetPct = cat.budget && cat.budget > 0 ? Math.min(100, Math.round((cat.amount / cat.budget) * 100)) : null;
            const isOverBudget = cat.budget && cat.budget > 0 && cat.amount > cat.budget;

            return (
              <div
                key={cat.id}
                onClick={() => !isEditMode && onSelectCategory(cat.id)}
                className={`p-3 rounded-2xl text-white flex flex-col justify-between h-[100px] transition-all shadow-sm overflow-hidden relative group ${
                  !isEditMode ? 'cursor-pointer active-scale hover:shadow-md' : ''
                } ${isEditMode && isHidden ? 'opacity-50 grayscale' : ''}`}
                style={{ backgroundColor: cat.bgHex }}
              >
                <div className="absolute top-0 right-0 p-2.5 flex items-center gap-1.5">
                  {isEditMode && (
                    <button
                      onClick={(e) => toggleCategoryVisibility(cat.id, e)}
                      className="w-7 h-7 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isHidden ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  )}
                  {!isEditMode && (
                    <span className="material-symbols-outlined text-[18px] opacity-90">{cat.icon}</span>
                  )}
                </div>
                <div className="mt-auto">
                  <p className="text-[11px] font-medium opacity-90 truncate">{cat.name}</p>
                  <p className="font-semibold text-[14px] leading-[20px] truncate">
                    {formatCurrency(cat.amount, currency)}
                  </p>
                  {budgetPct !== null && (
                    <div className="mt-1">
                      <div className="w-full bg-black/20 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isOverBudget ? 'bg-red-400' : 'bg-white/80'}`}
                          style={{ width: `${budgetPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {!isEditMode && (
                  <div className="absolute inset-0 bg-bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Latest Transactions */}
      <section className="space-y-3 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[16px] leading-[24px] text-text-primary">Latest transaction</h2>
          <button
            onClick={onSeeAllTransactions}
            className="text-[#0058be] text-[12px] font-medium hover:underline"
          >
            See all
          </button>
        </div>

        <div className="space-y-2.5">
          {latestTransactions.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-[13px] bg-bg-secondary rounded-2xl border border-border-color">
              No transactions yet. Tap + to add one!
            </div>
          ) : (
            latestTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="flex items-center gap-3.5 bg-bg-secondary p-3 rounded-2xl shadow-sm border border-border-color active-scale transition-all cursor-pointer hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e9edff] dark:bg-black/20 flex items-center justify-center shrink-0">
                    {tx.iconUrl ? (
                      <img
                        src={tx.iconUrl}
                        alt={tx.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-[#0058be]">
                        {cat?.icon || 'receipt'}
                      </span>
                    )}
                  </div>

                  <div className="flex-grow min-w-0">
                    <p className="text-[13px] font-semibold text-text-primary truncate">{tx.title}</p>
                    <p className="text-[11px] text-text-secondary truncate">
                      {tx.date} • {tx.paymentMethod}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-[13px] font-bold ${
                        tx.amount < 0 ? 'text-[#ba1a1a]' : 'text-[#27AE60]'
                      }`}
                    >
                      {formatAmount(tx.amount)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};
