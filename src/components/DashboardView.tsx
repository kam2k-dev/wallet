import React, { useState } from 'react';
import { Category, Transaction, CategoryId } from '../types';
import { CurrencyCode, formatCurrency } from '../utils/currency';

interface DashboardViewProps {
  categories: Category[];
  transactions: Transaction[];
  totalBalance: number;
  currency: CurrencyCode;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onSeeAllTransactions: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  categories,
  transactions,
  totalBalance,
  currency,
  onSelectCategory,
  onSelectTransaction,
  onSeeAllTransactions,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<Set<CategoryId>>(() => {
    const saved = localStorage.getItem('hiddenCategories');
    return saved ? new Set(JSON.parse(saved)) : new Set();
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
    <main className="px-5 space-y-6 pt-2 pb-28 max-w-md mx-auto">
      {/* Main Balance Section */}
      <section className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-[14px] leading-[20px]">Main balance</p>
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
          <h1 className="font-bold text-[28px] leading-[36px] text-text-primary tracking-tight">
            {showBalance ? formatCurrency(totalBalance, currency) : '••••••••'}
          </h1>
        </div>
      </section>

      {/* Category Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[16px] leading-[24px] text-text-primary">Categories</h2>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="text-[#0058be] text-[12px] font-medium hover:underline"
          >
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {visibleCategories.map((cat) => {
            const isHidden = hiddenCategories.has(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => !isEditMode && onSelectCategory(cat.id)}
                className={`p-4 rounded-3xl text-white flex flex-col justify-between aspect-square transition-all shadow-md overflow-hidden relative group ${
                  !isEditMode ? 'cursor-pointer active-scale hover:shadow-lg' : ''
                } ${isEditMode && isHidden ? 'opacity-50 grayscale' : ''}`}
                style={{ backgroundColor: cat.bgHex }}
              >
                <div className="absolute top-0 right-0 p-3 flex items-center gap-2">
                  {isEditMode && (
                    <button
                      onClick={(e) => toggleCategoryVisibility(cat.id, e)}
                      className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isHidden ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  )}
                  {!isEditMode && (
                    <span className="material-symbols-outlined text-[20px] opacity-90">{cat.icon}</span>
                  )}
                </div>
                <div className="mt-auto">
                  <p className="text-[12px] font-medium opacity-90">{cat.name}</p>
                  <p className="font-semibold text-[16px] leading-[24px]">
                    {formatCurrency(cat.amount, currency)}
                  </p>
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
      <section className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[16px] leading-[24px] text-text-primary">Latest transaction</h2>
          <button
            onClick={onSeeAllTransactions}
            className="text-[#0058be] text-[12px] font-medium hover:underline"
          >
            See all
          </button>
        </div>

        <div className="space-y-3">
          {latestTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="flex items-center gap-4 bg-bg-secondary p-3.5 rounded-2xl shadow-sm border border-border-color active-scale transition-all cursor-pointer hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e9edff] flex items-center justify-center shrink-0">
                {tx.iconUrl ? (
                  <img
                    src={tx.iconUrl}
                    alt={tx.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback icon on error
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-[#0058be]">
                    {tx.categoryId === 'groceries'
                      ? 'shopping_bag'
                      : tx.categoryId === 'transport'
                      ? 'directions_car'
                      : tx.categoryId === 'entertainment'
                      ? 'event'
                      : 'home'}
                  </span>
                )}
              </div>

              <div className="flex-grow min-w-0">
                <p className="text-[14px] font-semibold text-text-primary truncate">{tx.title}</p>
                <p className="text-[12px] text-text-secondary truncate">
                  {tx.date} • {tx.paymentMethod}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p
                  className={`text-[14px] font-bold ${
                    tx.amount < 0 ? 'text-[#ba1a1a]' : 'text-text-primary'
                  }`}
                >
                  {formatAmount(tx.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
