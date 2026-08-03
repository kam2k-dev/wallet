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

  // Take latest 5 transactions
  const latestTransactions = transactions.slice(0, 5);

  const formatAmount = (num: number) => formatCurrency(num, currency);

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
        </div>

        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="p-4 rounded-3xl text-white flex flex-col justify-between aspect-square active-scale transition-transform shadow-md overflow-hidden relative group cursor-pointer"
              style={{ backgroundColor: cat.bgHex }}
            >
              <div className="absolute top-0 right-0 p-3">
                <span className="material-symbols-outlined text-[20px] opacity-90">{cat.icon}</span>
              </div>
              <div className="mt-auto">
                <p className="text-[12px] font-medium opacity-90">{cat.name}</p>
                <p className="font-semibold text-[16px] leading-[24px]">
                  {formatCurrency(cat.amount, currency)}
                </p>
              </div>
              <div className="absolute inset-0 bg-bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
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
