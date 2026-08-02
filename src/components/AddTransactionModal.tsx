import React, { useState } from 'react';
import { Category, CategoryId, Transaction } from '../types';

interface AddTransactionModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  categories,
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('groceries');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [paymentMethod, setPaymentMethod] = useState('Card •••• 1234');
  const [dateStr, setDateStr] = useState('Sep 15, 2025');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount)) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);

    onAddTransaction({
      title: title.trim(),
      categoryId,
      categoryName: selectedCategory?.name || 'Groceries',
      amount: type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount),
      paymentMethod,
      date: dateStr,
      rawDate: new Date().toISOString().split('T')[0],
    });

    // Reset & close
    setTitle('');
    setAmount('');
    onClose();
  };

  const autoSelectCategory = (inputTitle: string) => {
    const lower = inputTitle.toLowerCase();
    if (lower.includes('mart') || lower.includes('food') || lower.includes('bakery') || lower.includes('market') || lower.includes('grocery')) {
      setCategoryId('groceries');
    } else if (lower.includes('gas') || lower.includes('uber') || lower.includes('bus') || lower.includes('train') || lower.includes('taxi') || lower.includes('car')) {
      setCategoryId('transport');
    } else if (lower.includes('cinema') || lower.includes('ticket') || lower.includes('concert') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('movie')) {
      setCategoryId('entertainment');
    } else if (lower.includes('rent') || lower.includes('electric') || lower.includes('water') || lower.includes('bill') || lower.includes('power')) {
      setCategoryId('rent');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-black/10 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#141b2b]">Add Transaction</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center text-[#47464b] hover:bg-[#e1e8fd]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Expense / Income Toggle */}
        <div className="flex bg-[#e9edff] p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-white text-[#141b2b] shadow-sm'
                : 'text-[#47464b] hover:text-[#141b2b]'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-xl transition-all ${
              type === 'income'
                ? 'bg-[#27AE60] text-white shadow-sm'
                : 'text-[#47464b] hover:text-[#141b2b]'
            }`}
          >
            Income (+)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#47464b] mb-1">
              Title / Merchant
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Supermart Groceries"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                autoSelectCategory(e.target.value);
              }}
              className="w-full px-4 py-3 bg-[#f1f3ff] rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-[#0058be]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#47464b] mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-[#f1f3ff] rounded-2xl text-[16px] font-bold text-[#141b2b] outline-none focus:ring-2 focus:ring-[#0058be]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#47464b] mb-1">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                    categoryId === cat.id
                      ? 'border-[#2170e4] bg-[#2170e4]/10 text-[#0058be] font-bold'
                      : 'border-black/5 bg-[#f1f3ff] text-[#47464b]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[13px] truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[12px] font-medium text-[#47464b] mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-3 bg-[#f1f3ff] rounded-2xl text-[13px] outline-none"
              >
                <option value="Card •••• 1234">Card •••• 1234</option>
                <option value="Paid with Visa">Paid with Visa</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#47464b] mb-1">
                Date
              </label>
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-3 bg-[#f1f3ff] rounded-2xl text-[13px] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#000000] text-white font-semibold rounded-full hover:bg-black/80 transition-all active:scale-95 shadow-md mt-2"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};
