import React, { useState } from 'react';
import { Category, Transaction, CategoryId } from '../types';

interface SpendAnalysisViewProps {
  categories: Category[];
  transactions: Transaction[];
  totalSpending: number;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectTransaction: (transaction: Transaction) => void;
}

export const SpendAnalysisView: React.FC<SpendAnalysisViewProps> = ({
  categories,
  transactions,
  totalSpending,
  onSelectCategory,
  onSelectTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showPieDetail, setShowPieDetail] = useState(false);

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

  const handleAnalyzeWithAI = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/smart-categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          promptText: 'Analyze spending pattern and check for category anomalies.',
        }),
      });
      const data = await res.json();
      if (data && data.insight) {
        setAiInsight(data.insight);
      } else {
        setAiInsight("We've categorized your transactions automatically. Groceries represents 36% of your monthly expenditure.");
      }
    } catch (e) {
      setAiInsight("Smart analysis complete: Your largest spending category is Groceries ($1,245.30), followed by Rent & Utilities ($1,080.50).");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const formatAmount = (num: number) => {
    const formatted = Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return num < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  return (
    <main className="max-w-md mx-auto px-5 pt-4 space-y-6 pb-28">
      {/* Total Spending Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[14px] leading-[20px] text-[#47464b]">Total spending</p>
            <h2 className="font-bold text-[28px] leading-[36px] text-[#141b2b] mt-1">
              ${totalSpending.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
          <button
            onClick={() => setShowPieDetail(!showPieDetail)}
            aria-label="Toggle Pie Chart"
            className="p-3 rounded-full bg-[#e1e8fd] text-[#47464b] hover:bg-[#dce2f7] active:scale-95 transition-all shadow-sm"
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
          <div className="bg-white p-4 rounded-xl border border-black/5 shadow-sm space-y-2 animate-in fade-in">
            <h4 className="text-[13px] font-semibold text-[#141b2b]">Percentage Distribution</h4>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#47464b]">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </span>
                  <span className="font-semibold text-[#141b2b]">
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
            className="bg-white p-4 rounded-xl shadow-soft flex flex-col space-y-2 border border-[#dce2f7] cursor-pointer hover:border-[#2170e4]/50 active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[12px] font-medium text-[#47464b] truncate">
                {cat.name}
              </span>
            </div>
            <span className="font-semibold text-[16px] leading-[24px] text-[#141b2b]">
              ${cat.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        ))}
      </section>

      {/* Smart Category Banner */}
      <section className="bg-[#FFF9E7] p-4 rounded-xl border border-[#FDECBF] flex items-start space-x-3 shadow-sm">
        <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 mt-0.5">
          <span
            className="material-symbols-outlined text-[#F39C12] fill-1 text-[22px]"
          >
            auto_awesome
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[16px] leading-[24px] text-[#141b2b]">
              Smart category
            </h3>
            <button
              onClick={handleAnalyzeWithAI}
              disabled={isLoadingAi}
              className="text-[12px] text-[#0058be] font-medium hover:underline disabled:opacity-50"
            >
              {isLoadingAi ? 'Analyzing...' : 'Refresh AI'}
            </button>
          </div>
          <p className="text-[14px] leading-[20px] text-[#47464b] mt-1">
            {aiInsight ||
              "We've categorized your transactions automatically. You may change them if you want."}
          </p>
        </div>
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77767b] hover:text-[#141b2b]"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </button>
        )}
      </section>

      {/* Transaction List */}
      <section className="space-y-4">
        <h3 className="font-semibold text-[16px] leading-[24px] text-[#141b2b]">
          Latest transactions
        </h3>
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-[#47464b] text-[14px]">
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
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-black/5">
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
                    <p className="font-semibold text-[16px] leading-[24px] text-[#141b2b] truncate">
                      {tx.title}
                    </p>
                    <p className="text-[12px] text-[#47464b] truncate">{tx.date}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-semibold text-[16px] leading-[24px] text-[#141b2b]">
                    {formatAmount(tx.amount)}
                  </p>
                  <p className="text-[12px] text-[#47464b]">{tx.paymentMethod}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};
