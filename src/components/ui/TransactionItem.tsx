import React from 'react';
import { Transaction, Category } from '../../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, CurrencyCode } from '../../utils/currency';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category | null;
  currency?: CurrencyCode;
  onClick?: (transaction: Transaction) => void;
  subtitleMode?: 'date-payment' | 'payment-category' | 'payment-date';
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  currency = 'IDR',
  onClick,
  subtitleMode = 'payment-category',
}) => {
  const isIncome = transaction.amount > 0;

  const renderSubtitle = () => {
    switch (subtitleMode) {
      case 'date-payment':
        return (
          <>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-bg-tertiary rounded-md text-text-secondary">
              {transaction.paymentMethod}
            </span>
            <span className="text-[11px] text-text-secondary truncate">
              {transaction.date}
            </span>
          </>
        );
      case 'payment-date':
        return (
          <>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-bg-tertiary rounded-md text-text-secondary">
              {transaction.paymentMethod}
            </span>
            <span className="text-[11px] text-text-secondary truncate">
              {transaction.date}
            </span>
          </>
        );
      case 'payment-category':
      default:
        return (
          <>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-bg-tertiary rounded-md text-text-secondary">
              {transaction.paymentMethod}
            </span>
            <span className="text-[11px] text-text-secondary truncate">
              {category?.name || transaction.categoryName}
            </span>
          </>
        );
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(transaction)}
      className="flex items-center gap-3.5 bg-bg-secondary p-3 rounded-2xl shadow-xs border border-border-color transition-all duration-200 cursor-pointer hover:shadow-md hover:border-brand-primary/30 active:scale-[0.99]"
    >
      <CategoryIcon category={category} size="lg" />

      <div className="flex-grow min-w-0">
        <p className="text-[13px] font-bold text-text-primary truncate">
          {transaction.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {renderSubtitle()}
        </div>
      </div>

      <div className="text-right shrink-0">
        <p
          className={`text-[14px] font-black ${
            isIncome ? 'text-brand-income' : 'text-brand-expense'
          }`}
        >
          {isIncome ? '+' : ''}
          {formatCurrency(transaction.amount, currency)}
        </p>
      </div>
    </div>
  );
};
