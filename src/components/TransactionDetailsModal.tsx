import React from 'react';
import { Transaction, Category } from '../types';
import { formatCurrency, CurrencyCode } from '../utils/currency';
import { CategoryIcon } from './ui/CategoryIcon';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  categories: Category[];
  currency: CurrencyCode;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  categories,
  currency,
  onClose,
  onDelete,
  onEdit,
}) => {
  if (!transaction) return null;

  const category = categories.find((c) => c.id === transaction.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-bg-secondary rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-border-color space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-text-primary">Transaction Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary hover:bg-[#e1e8fd] transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <CategoryIcon category={category} size="xl" className="shadow-md" />
          <h2 className="text-[20px] font-bold text-text-primary text-center">{transaction.title}</h2>
          <p
            className={`text-[24px] font-bold ${
              transaction.amount < 0 ? 'text-brand-expense' : 'text-brand-income'
            }`}
          >
            {formatCurrency(transaction.amount, currency)}
          </p>
        </div>

        <div className="bg-bg-primary p-4 rounded-2xl space-y-3 text-[14px]">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Category</span>
            <span className="font-semibold text-text-primary flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: category?.color || '#0058be' }}
              />
              {transaction.categoryName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Date</span>
            <span className="font-semibold text-text-primary">{transaction.date}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Payment Method</span>
            <span className="font-semibold text-text-primary">{transaction.paymentMethod}</span>
          </div>

          {transaction.notes && (
            <div className="flex justify-between items-start">
              <span className="text-text-secondary">Notes</span>
              <span className="font-medium text-text-primary text-right max-w-[180px] break-words">
                {transaction.notes}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Status</span>
            <span className="font-semibold text-[#27AE60] bg-[#27AE60]/10 px-2 py-0.5 rounded-md text-[12px]">
              Completed
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              onDelete(transaction.id);
              onClose();
            }}
            className="flex-1 py-3 bg-[#ffdad6] text-[#93000a] font-semibold rounded-full hover:bg-[#ffb4ab] transition-all text-[14px]"
          >
            Delete
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onEdit(transaction);
                onClose();
              }}
              className="flex-1 py-3 bg-[#e1e8fd] text-[#0058be] font-semibold rounded-full hover:bg-[#d0dcfa] transition-all text-[14px]"
            >
              Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#000000] dark:bg-[#2170e4] text-white font-semibold rounded-full hover:opacity-90 transition-all text-[14px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
