import React, { useState } from 'react';
import { Category, Transaction, CategoryId } from '../types';
import { CurrencyCode, formatCurrency } from '../utils/currency';

interface SpendAnalysisViewProps {
  categories: Category[];
  transactions: Transaction[];
  totalSpending: number;
  currency: CurrencyCode;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectTransaction: (transaction: Transaction) => void;
}

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

  const formatAmount = (num: number) => formatCurrency(num, currency);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.title.toLowerCase().includes(q) ||
      tx.categoryName.toLowerCase().includes(q) ||
      tx.date.toLowerCase().includes(q) ||
      tx.paymentMethod.toLowerCase().includes(q)
    );
  });

  // Calculate percentages for segmented bar
  const getPercentage = (amount: number) => {
    if (!totalSpending || totalSpending <= 0) return 25;
    return Math.max(5, Math.round((amount / totalSpending) * 100));
  };

  return (
    <main className="max-w-md mx-auto px-5 pt-4 space-y-6 pb-28">
      {/* Total Spending Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[14px] leading-[20px] text-text-secondary">Total spending</p>
            <h2 className="font-bold text-[28px] leading-[36px] text-text-primary mt-1">
              {formatCurrency(totalSpending, currency)}
            </h2>
          </div>
          <button
            onClick={() => setShowPieDetail(!showPieDetail)}
            aria-label="Toggle Pie Chart"
            className="p-3 rounded-full bg-[#e1e8fd] text-text-secondary hover:bg-[#dce2f7] active:scale-95 transition-all shadow-sm"
          >
            <span
              className={`material-symbols-outlined ${
                showPieDetail ? 'fill-1 text-[#0058be]' : ''
              }`}
            >
              pie_chart
            </span>
          </button>
        </div>

        {/* Segmented Progress Bar */}
        <div className="h-4 w-full flex rounded-full overflow-hidden bg-black/5 p-0.5">
          {categories.map((cat, idx) => {
            const pct = getPercentage(cat.amount);
            return (
              <div
                key={cat.id}
                className={`h-full transition-all duration-300 ${
                  idx > 0 ? 'ml-[2px]' : ''
                }`}
                style={{
                  width: `${pct}%`,
                  backgroundColor: cat.color,
                }}
                title={`${cat.name}: ${pct}%`}
              />
            );
          })}
        </div>

        {/* Optional Pie Detail Breakdown */}
        {showPieDetail && (
          <div className="bg-bg-secondary p-4 rounded-xl border border-border-color shadow-sm space-y-2 animate-in fade-in">
            <h4 className="text-[13px] font-semibold text-text-primary">Percentage Distribution</h4>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-text-secondary">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </span>
                  <span className="font-semibold text-text-primary">
                    {getPercentage(cat.amount)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Category Grid */}
      <section className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="bg-bg-secondary p-4 rounded-xl shadow-soft flex flex-col space-y-2 border border-[#dce2f7] cursor-pointer hover:border-[#2170e4]/50 active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[12px] font-medium text-text-secondary truncate">
                {cat.name}
              </span>
            </div>
            <span className="font-semibold text-[16px] leading-[24px] text-text-primary">
              {formatCurrency(cat.amount, currency)}
            </span>
          </div>
        ))}
      </section>

      {/* Search Bar */}
      <section className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#77767b]">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for any transaction"
          className="w-full h-12 pl-12 pr-4 bg-[#e9edff] rounded-full border-none focus:ring-2 focus:ring-[#0058be] text-[14px] placeholder:text-[#77767b] outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77767b] hover:text-text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </button>
        )}
      </section>

      {/* Transaction List */}
      <section className="space-y-4">
        <h3 className="font-semibold text-[16px] leading-[24px] text-text-primary">
          Latest transactions
        </h3>
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-[14px]">
              No transactions match "{searchQuery}"
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-border-color">
                    {tx.iconUrl ? (
                      <img
                        src={tx.iconUrl}
                        alt={tx.title}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
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
                  <div className="min-w-0">
                    <p className="font-semibold text-[16px] leading-[24px] text-text-primary truncate">
                      {tx.title}
                    </p>
                    <p className="text-[12px] text-text-secondary truncate">{tx.date}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-semibold text-[16px] leading-[24px] text-text-primary">
                    {formatAmount(tx.amount)}
                  </p>
                  <p className="text-[12px] text-text-secondary">{tx.paymentMethod}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};
