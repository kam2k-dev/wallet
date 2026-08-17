import React, { useState, useMemo } from 'react';
import { Category, Transaction, CategoryId, ChartPoint } from '../types';
import { CurrencyCode, formatCurrency } from '../utils/currency';
import { CategoryIcon } from './ui/CategoryIcon';
import { TransactionItem } from './ui/TransactionItem';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

interface WalletDetailsViewProps {
  category: Category;
  categories: Category[];
  transactions: Transaction[];
  currency: CurrencyCode;
  onSelectCategory: (categoryId: CategoryId) => void;
  onOpenAddModal: () => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onQuickAction: (actionName: string) => void;
}

export const WalletDetailsView: React.FC<WalletDetailsViewProps> = ({
  category,
  categories = [],
  transactions = [],
  currency,
  onSelectCategory,
  onOpenAddModal,
  onSelectTransaction,
  onQuickAction,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

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
    <main className="pt-2 px-5 space-y-5 pb-36 max-w-md mx-auto">
      {/* Category Selector Bar */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
            Select Category
          </p>
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="text-[12px] text-brand-primary font-medium hover:underline flex items-center gap-1"
          >
            <span>{isCategoryDropdownOpen ? 'Hide List' : 'View All'}</span>
            {isCategoryDropdownOpen ? (
              <ChevronUpIcon className="w-3.5 h-3.5" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Horizontal Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = cat.id === category.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl whitespace-nowrap transition-all text-[13px] font-medium border ${
                  isSelected
                    ? 'bg-text-primary text-bg-primary border-transparent shadow-sm'
                    : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary border-border-color'
                }`}
              >
                <CategoryIcon category={cat} size="sm" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Expanded Category Grid Dropdown */}
        {isCategoryDropdownOpen && (
          <div className="grid grid-cols-2 gap-2 p-3 bg-bg-secondary rounded-2xl border border-border-color shadow-sm animate-in fade-in">
            {categories.map((cat) => {
              const isSelected = cat.id === category.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setIsCategoryDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-brand-primary/10 border border-brand-primary/40 text-brand-primary font-bold'
                      : 'hover:bg-bg-primary border border-transparent text-text-primary'
                  }`}
                >
                  <CategoryIcon category={cat} size="md" />
                  <span className="truncate text-[13px]">{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Hero Category Overview Card */}
      <section className="bg-bg-secondary p-5 rounded-3xl border border-border-color shadow-xs">
        <div className="flex items-center gap-3.5">
          <CategoryIcon category={category} size="xl" />
          <div className="min-w-0">
            <p className="text-text-secondary text-[13px] font-medium truncate">
              {category.name}
            </p>
            <p className="font-bold text-[26px] leading-[32px] tracking-tight text-text-primary truncate">
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
              className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center hover:bg-bg-tertiary transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 text-text-primary" />
            </button>
            <button
              onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
              aria-label="Next Month"
              className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center hover:bg-bg-tertiary transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5 text-text-primary" />
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
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#77767b]">
          <MagnifyingGlassIcon className="w-4 h-4 text-text-secondary" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for any transaction"
          className="w-full pl-11 pr-4 py-3.5 bg-bg-tertiary border-none rounded-full text-[14px] focus:ring-2 focus:ring-brand-primary/20 placeholder:text-[#77767b] outline-none text-text-primary"
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
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[16px] leading-[24px] text-text-primary">
            Latest transaction
          </h3>
        </div>

        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-[13px] bg-bg-secondary rounded-2xl border border-border-color">
              No transactions found in {category.name}
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                category={category}
                currency={currency}
                onClick={onSelectTransaction}
                subtitleMode="payment-date"
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
};
