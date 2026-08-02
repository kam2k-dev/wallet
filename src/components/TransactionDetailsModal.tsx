import React from 'react';
import { Transaction, Category } from '../types';
import { CurrencyCode, formatCurrency } from '../utils/currency';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  categories: Category[];
  currency: CurrencyCode;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  categories,
  currency,
  onClose,
  onDelete,
}) => {
  if (!transaction) return null;

  const category = categories.find((c) => c.id === transaction.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-black/10 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-bold text-[#141b2b]">Transaction Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#47464b] hover:bg-[#e1e8fd]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <div className="w-16 h-16 rounded-full bg-[#f1f3ff] flex items-center justify-center overflow-hidden border border-black/5 shadow-sm">
            {transaction.iconUrl ? (
              <img
                src={transaction.iconUrl}
                alt={transaction.title}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="material-symbols-outlined text-[28px] text-[#0058be]">
                {category?.icon || 'receipt'}
              </span>
            )}
          </div>
          <h2 className="text-[20px] font-bold text-[#141b2b] text-center">{transaction.title}</h2>
          <p
            className={`text-[24px] font-bold ${
              transaction.amount < 0 ? 'text-[#ba1a1a]' : 'text-[#27AE60]'
            }`}
          >
            {formatCurrency(transaction.amount, currency)}
          </p>
        </div>

        <div className="bg-[#f9f9ff] p-4 rounded-2xl space-y-3 text-[14px]">
          <div className="flex justify-between items-center">
            <span className="text-[#47464b]">Category</span>
            <span className="font-semibold text-[#141b2b] flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: category?.color || '#0058be' }}
              />
              {transaction.categoryName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#47464b]">Date</span>
            <span className="font-semibold text-[#141b2b]">{transaction.date}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#47464b]">Payment Method</span>
            <span className="font-semibold text-[#141b2b]">{transaction.paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#47464b]">Status</span>
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
            className="flex-1 py-3 bg-[#ffdad6] text-[#93000a] font-semibold rounded-full hover:bg-[#ffb4ab] transition-all"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-[#000000] text-white font-semibold rounded-full hover:bg-black/80 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
