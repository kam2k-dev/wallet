import React, { useState, useMemo } from 'react';
import { Category, Transaction, CategoryId, ChartPoint } from '../types';
import { CurrencyCode, formatCurrency } from '../utils/currency';

interface WalletDetailsViewProps {
  category: Category;
  transactions: Transaction[];
  currency: CurrencyCode;
  onOpenAddModal: () => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onQuickAction: (actionName: string) => void;
}

export const WalletDetailsView: React.FC<WalletDetailsViewProps> = ({
  category,
  transactions,
  currency,
  onOpenAddModal,
  onSelectTransaction,
  onQuickAction,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);

  // Dynamic month calculation
  const currentMonthDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthOffset);
    return d;
  }, [monthOffset]);

  const currentMonthName = useMemo(() => {
    return currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonthDate]);

  // Filter transactions for this category and selected month
  const categoryTransactions = useMemo(() => {
    const targetYear = currentMonthDate.getFullYear();
    const targetMonth = currentMonthDate.getMonth();

    return transactions.filter((tx) => {
      if (tx.categoryId !== category.id) return false;
      if (!tx.rawDate) return true;
      const txDate = new Date(tx.rawDate);
      return txDate.getFullYear() === targetYear && txDate.getMonth() === targetMonth;
    });
  }, [transactions, category.id, currentMonthDate]);

  const filteredTransactions = categoryTransactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.title.toLowerCase().includes(q) ||
      tx.date.toLowerCase().includes(q) ||
      tx.paymentMethod.toLowerCase().includes(q)
    );
  });

  // Generate chart points from actual transaction data
  const chartPoints = useMemo(() => {
    const dailyTotals: Record<number, number> = {};

    // Aggregate transactions by day
    categoryTransactions.forEach((tx) => {
      if (tx.rawDate) {
        const parts = tx.rawDate.split('-');
        const day = parseInt(parts[2], 10);
        if (!isNaN(day)) {
          dailyTotals[day] = (dailyTotals[day] || 0) + Math.abs(tx.amount);
        }
      }
    });

    const monthShort = currentMonthDate.toLocaleDateString('en-US', { month: 'short' });
    const year = currentMonthDate.getFullYear();

    // Convert to chart points
    const points: ChartPoint[] = Object.entries(dailyTotals)
      .map(([day, amount]) => ({
        dayNum: parseInt(day, 10),
        dateLabel: `${monthShort} ${day}`,
        fullDate: `${monthShort} ${day}, ${year}`,
        amount,
      }))
      .sort((a, b) => a.dayNum - b.dayNum);

    // If no data, return default points for the month
    if (points.length === 0) {
      return [
        { dayNum: 1, dateLabel: `${monthShort} 1`, fullDate: `${monthShort} 1, ${year}`, amount: 0 },
        { dayNum: 15, dateLabel: `${monthShort} 15`, fullDate: `${monthShort} 15, ${year}`, amount: 0 },
        { dayNum: 28, dateLabel: `${monthShort} 28`, fullDate: `${monthShort} 28, ${year}`, amount: 0 },
      ];
    }

    return points;
  }, [categoryTransactions, currentMonthDate]);

  const activePoint = chartPoints[selectedPointIndex] || chartPoints[0];

  // SVG coordinate calculations for smoothly rendering line chart
  const width = 400;
  const height = 150;
  const paddingX = 20;
  const paddingY = 30;

  const amounts = chartPoints.map((p) => p.amount);
  const minAmt = Math.min(...amounts, 0);
  const maxAmt = Math.max(...amounts, 100);

  const pointsWithCoords = chartPoints.map((pt, idx) => {
    const x =
      chartPoints.length > 1
        ? paddingX + (idx / (chartPoints.length - 1)) * (width - 2 * paddingX)
        : width / 2;
    const y = height - paddingY - ((pt.amount - minAmt) / (maxAmt - minAmt)) * (height - 2 * paddingY);
    return { ...pt, x, y };
  });

  // Generate cubic bezier SVG path string
  const pathD = pointsWithCoords.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
  }, '');

  const activeCoord = pointsWithCoords[selectedPointIndex];

  return (
    <main className="pt-2 px-5 space-y-6 pb-36 max-w-md mx-auto">
      {/* Header Card */}
      <section className="mt-2">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
            style={{ backgroundColor: category.color }}
          >
            <span className="material-symbols-outlined fill-1 text-[28px]">
              {category.icon}
            </span>
          </div>
          <div>
            <p className="text-[#77767b] text-[14px] leading-[20px] font-medium">
              {category.name}
            </p>
            <p className="font-bold text-[28px] leading-[36px] tracking-tight text-text-primary">
              {formatCurrency(category.amount, currency)}
            </p>
          </div>
        </div>
      </section>

      {/* Timeframe & Chart Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[16px] leading-[24px] text-text-primary">
              {currentMonthName}
            </h2>
            <p className="text-[#77767b] text-[12px] leading-[16px]">
              <span className="text-text-primary font-bold">
                {formatCurrency(categoryTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0), currency)}
              </span>{' '}
              Spent
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMonthOffset((prev) => prev + 1)}
              aria-label="Previous Month"
              className="w-10 h-10 rounded-full border border-[#c8c5cb] flex items-center justify-center hover:bg-[#e9edff] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
              aria-label="Next Month"
              className="w-10 h-10 rounded-full border border-[#c8c5cb] flex items-center justify-center hover:bg-[#e9edff] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Line Chart Representation */}
        <div className="w-full bg-gradient-to-b from-[#9466ff]/10 to-transparent rounded-2xl p-4 border border-border-color shadow-inner">
          <div className="relative w-full" style={{ aspectRatio: '400 / 150' }}>
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
            >
              {/* Smooth Curve */}
              <path
                d={pathD}
                fill="none"
                stroke={category.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* Vertical Indicator Line */}
              {activeCoord && (
                <line
                  x1={activeCoord.x}
                  y1={height - 20}
                  x2={activeCoord.x}
                  y2={activeCoord.y}
                  stroke={category.color}
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
              )}
              {/* Clickable Chart Points */}
              {pointsWithCoords.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={selectedPointIndex === idx ? 6 : 4}
                  fill={category.color}
                  stroke="#ffffff"
                  strokeWidth={selectedPointIndex === idx ? 2 : 1}
                  className="cursor-pointer hover:r-7 transition-all"
                  onClick={() => setSelectedPointIndex(idx)}
                />
              ))}
            </svg>

            {/* Dynamic Tooltip — clamped so it never clips at the edges */}
            {activeCoord && (
              <div
                className="absolute bg-black text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-xl z-20 transition-all duration-200 pointer-events-none whitespace-nowrap"
                style={{
                  left: `clamp(80px, ${(activeCoord.x / width) * 100}%, calc(100% - 80px))`,
                  top: `${(activeCoord.y / height) * 100}%`,
                  transform:
                    activeCoord.y < 45
                      ? 'translate(-50%, 16px)'
                      : 'translate(-50%, calc(-100% - 16px))',
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="font-bold text-[13px]">
                    {formatCurrency(activePoint.amount, currency)}
                  </span>
                  <span className="text-[10px] opacity-75">{activePoint.fullDate}</span>
                </div>
              </div>
            )}
          </div>

          {/* X Axis Date Labels */}
          <div className="flex justify-between mt-2 text-[11px] text-[#77767b] px-1 font-medium">
            <span>{chartPoints[0]?.dateLabel || ''}</span>
            <span>{chartPoints[Math.floor(chartPoints.length / 2)]?.dateLabel || ''}</span>
            <span>{chartPoints[chartPoints.length - 1]?.dateLabel || ''}</span>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#77767b] text-[20px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for any transaction"
          className="w-full pl-12 pr-4 py-3.5 bg-bg-tertiary border-none rounded-full text-[14px] focus:ring-2 focus:ring-[#0058be]/20 placeholder:text-[#77767b] outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77767b]"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </button>
        )}
      </section>

      {/* Transaction List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[16px] leading-[24px] text-text-primary">
            Latest transaction
          </h3>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-[#77767b] text-[14px]">
              No transactions found in {category.name}
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl border border-border-color hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#e9edff] flex items-center justify-center overflow-hidden shrink-0">
                    {tx.iconUrl ? (
                      <img
                        src={tx.iconUrl}
                        alt={tx.title}
                        className="w-10 h-10 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[#0058be]">
                        {category.icon}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[16px] text-text-primary truncate">
                      {tx.title}
                    </p>
                    <p className="text-[12px] text-[#77767b] truncate">
                      {tx.date}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-[16px] text-text-primary shrink-0">
                  {formatCurrency(tx.amount, currency)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
};
