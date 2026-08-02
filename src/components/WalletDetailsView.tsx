import React, { useState } from 'react';
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

const MOCK_CHART_POINTS: ChartPoint[] = [
  { dayNum: 1, dateLabel: 'Sep 1', fullDate: 'Sep 1, 2025', amount: 35.20 },
  { dayNum: 3, dateLabel: 'Sep 3', fullDate: 'Sep 3, 2025', amount: 55.40 },
  { dayNum: 5, dateLabel: 'Sep 5', fullDate: 'Sep 5, 2025', amount: 28.10 },
  { dayNum: 7, dateLabel: 'Sep 7', fullDate: 'Sep 7, 2025', amount: 82.75 },
  { dayNum: 10, dateLabel: 'Sep 10', fullDate: 'Sep 10, 2025', amount: 42.00 },
  { dayNum: 12, dateLabel: 'Sep 12', fullDate: 'Sep 12, 2025', amount: 75.30 },
  { dayNum: 14, dateLabel: 'Sep 14', fullDate: 'Sep 14, 2025', amount: 52.30 },
  { dayNum: 15, dateLabel: 'Sep 15', fullDate: 'Sep 15, 2025', amount: 64.10 },
];

export const WalletDetailsView: React.FC<WalletDetailsViewProps> = ({
  category,
  transactions,
  currency,
  onOpenAddModal,
  onSelectTransaction,
  onQuickAction,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState(3); // Default Sep 7
  const [searchQuery, setSearchQuery] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);

  const months = ['September, 2025', 'August, 2025', 'July, 2025'];
  const currentMonthName = months[(monthOffset + months.length) % months.length];

  // Filter transactions for this category
  const categoryTransactions = transactions.filter(
    (tx) => tx.categoryId === category.id
  );

  const filteredTransactions = categoryTransactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.title.toLowerCase().includes(q) ||
      tx.date.toLowerCase().includes(q) ||
      tx.paymentMethod.toLowerCase().includes(q)
    );
  });

  const activePoint = MOCK_CHART_POINTS[selectedPointIndex] || MOCK_CHART_POINTS[3];

  // SVG coordinate calculations for smoothly rendering line chart
  const width = 400;
  const height = 150;
  const paddingX = 20;
  const paddingY = 30;

  const minAmt = 20;
  const maxAmt = 90;

  const pointsWithCoords = MOCK_CHART_POINTS.map((pt, idx) => {
    const x = paddingX + (idx / (MOCK_CHART_POINTS.length - 1)) * (width - 2 * paddingX);
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
            <p className="font-bold text-[28px] leading-[36px] tracking-tight text-[#141b2b]">
              ${category.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Timeframe & Chart Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-[16px] leading-[24px] text-[#141b2b]">
              {currentMonthName}
            </h2>
            <p className="text-[#77767b] text-[12px] leading-[16px]">
              <span className="text-[#141b2b] font-bold">$124.52</span> Spent
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
        <div className="relative w-full h-52 bg-gradient-to-b from-[#9466ff]/10 to-transparent rounded-2xl p-4 overflow-hidden border border-black/5 shadow-inner">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            {/* Smooth Curve */}
            <path
              d={pathD}
              fill="none"
              stroke={category.color}
              strokeWidth="2.5"
              strokeLinecap="round"
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

          {/* Dynamic Tooltip */}
          {activeCoord && (
            <div
              className="absolute bg-black text-white px-3 py-1.5 rounded-xl text-xs font-medium shadow-xl z-20 transition-all duration-200 pointer-events-none"
              style={{
                left: `${(activeCoord.x / width) * 100}%`,
                top: `${(activeCoord.y / height) * 60 + 10}px`,
                transform: 'translate(-50%, -100%)',
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

          {/* X Axis Date Labels */}
          <div className="flex justify-between mt-1 text-[11px] text-[#77767b] px-2 font-medium">
            <span>Sep 1</span>
            <span>Sep 7</span>
            <span>Sep 15</span>
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
          className="w-full pl-12 pr-4 py-3.5 bg-[#f1f3ff] border-none rounded-full text-[14px] focus:ring-2 focus:ring-[#0058be]/20 placeholder:text-[#77767b] outline-none"
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
          <h3 className="font-semibold text-[16px] leading-[24px] text-[#141b2b]">
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
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 hover:shadow-md transition-shadow cursor-pointer"
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
                    <p className="font-semibold text-[16px] text-[#141b2b] truncate">
                      {tx.title}
                    </p>
                    <p className="text-[12px] text-[#77767b] truncate">
                      {tx.date} • {tx.paymentMethod}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-[16px] text-[#141b2b] shrink-0">
                  {formatCurrency(tx.amount, currency)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Floating Bottom Action Bar Pill */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 ios-liquid-glass px-6 py-2.5 rounded-full flex items-center gap-6 shadow-xl z-40">
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 text-[#141b2b] hover:text-[#007aff] transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-[20px] text-[#007aff]">add</span>
          <span className="text-[13px] font-semibold">Add</span>
        </button>

        <div className="w-[1px] h-4 bg-black/10" />

        <button
          onClick={() => onQuickAction('Move Funds')}
          className="flex items-center gap-2 text-[#141b2b] hover:text-[#007aff] transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-[20px] text-[#007aff]">swap_horiz</span>
          <span className="text-[13px] font-semibold">Move</span>
        </button>

        <div className="w-[1px] h-4 bg-black/10" />

        <button
          onClick={() => onQuickAction('Send Funds')}
          className="flex items-center gap-2 text-[#141b2b] hover:text-[#007aff] transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-[20px] text-[#007aff]">send</span>
          <span className="text-[13px] font-semibold">Send</span>
        </button>
      </div>
    </main>
  );
};
