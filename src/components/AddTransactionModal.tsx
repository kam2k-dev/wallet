import React, { useState } from 'react';
import { Category, CategoryId, Transaction } from '../types';
import { CurrencyCode, getCurrency } from '../utils/currency';

interface AddTransactionModalProps {
  categories: Category[];
  isOpen: boolean;
  currency?: CurrencyCode;
  initialData?: Transaction | null;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction?: (transaction: Transaction) => void;
}

const PAYMENT_METHODS = ['Cash', 'BCA', 'Mandiri', 'BRI', 'BNI', 'GoPay', 'OVO', 'Dana', 'ShopeePay', 'Credit Card'];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  categories,
  isOpen,
  currency = 'IDR',
  initialData,
  onClose,
  onAddTransaction,
  onUpdateTransaction,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('groceries');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isPaymentMenuOpen, setIsPaymentMenuOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [rawDate, setRawDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Populate form if editing
  React.useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(Math.abs(initialData.amount).toString());
      setCategoryId(initialData.categoryId);
      setType(initialData.amount < 0 ? 'expense' : 'income');
      setPaymentMethod(initialData.paymentMethod || 'Cash');
      setNotes(initialData.notes || '');
      setRawDate(initialData.rawDate || new Date().toISOString().split('T')[0]);
    } else {
      setTitle('');
      setAmount('');
      setCategoryId('groceries');
      setType('expense');
      setPaymentMethod('Cash');
      setNotes('');
      setRawDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  const activeCur = getCurrency(currency as CurrencyCode);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount)) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const parsedDate = rawDate ? new Date(`${rawDate}T00:00:00`) : new Date();
    const displayDate = parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const txPayload = {
      title: title.trim(),
      categoryId,
      categoryName: selectedCategory?.name || 'Groceries',
      amount: type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount),
      paymentMethod,
      notes: notes.trim() || undefined,
      date: displayDate,
      rawDate,
    };

    if (initialData && onUpdateTransaction) {
      onUpdateTransaction({
        ...txPayload,
        id: initialData.id,
      });
    } else {
      onAddTransaction(txPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-bg-secondary rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border-color space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-text-primary">
            {initialData ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary hover:bg-[#e1e8fd]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Expense / Income Toggle */}
        <div className="flex bg-bg-tertiary p-1 rounded-2xl border border-border-color">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategoryId('groceries');
            }}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-[#ba1a1a] text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategoryId('salary');
            }}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-xl transition-all ${
              type === 'income'
                ? 'bg-[#27AE60] text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              Title / Merchant
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Supermart Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-tertiary rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-[#0058be]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              Amount ({activeCur.symbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              required
              placeholder="0.00"
              value={amount ? Number(amount.replace(/,/g, '')).toLocaleString('en-US') : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, '');
                if (!isNaN(Number(rawValue))) {
                  setAmount(rawValue);
                }
              }}
              className="w-full px-4 py-2.5 bg-bg-tertiary rounded-2xl text-[16px] font-bold text-text-primary outline-none focus:ring-2 focus:ring-[#0058be]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {categories
                .filter((cat) => {
                  if (cat.type) {
                    return cat.type === type;
                  }
                  // Fallback for old data without type
                  return type === 'income' 
                    ? ['salary', 'freelance', 'investment', 'other_income'].includes(cat.id) 
                    : !['salary', 'freelance', 'investment', 'other_income'].includes(cat.id);
                })
                .map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                    categoryId === cat.id
                      ? 'border-[#2170e4] bg-[#2170e4]/10 text-[#0058be] font-bold'
                      : 'border-border-color bg-bg-tertiary text-text-secondary'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[12px] truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Custom Payment Method Dropdown */}
            <div className="relative">
              <label className="block text-[12px] font-medium text-text-secondary mb-1">
                Payment Method
              </label>
              <button
                type="button"
                onClick={() => setIsPaymentMenuOpen(!isPaymentMenuOpen)}
                className={`w-full px-3.5 py-2.5 bg-bg-tertiary rounded-2xl text-[13px] font-medium text-text-primary flex items-center justify-between border transition-all ${
                  isPaymentMenuOpen
                    ? 'border-[#0058be] ring-2 ring-[#0058be]/20'
                    : 'border-transparent hover:border-border-color'
                }`}
              >
                <span className="truncate">{paymentMethod}</span>
                <span
                  className={`material-symbols-outlined text-[18px] text-text-secondary shrink-0 transition-transform duration-200 ${
                    isPaymentMenuOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Floating Menu */}
              {isPaymentMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPaymentMenuOpen(false)}
                  />
                  <div className="absolute left-0 right-0 bottom-full mb-1.5 max-h-48 overflow-y-auto bg-bg-secondary rounded-2xl border border-border-color shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                    {PAYMENT_METHODS.map((pm) => {
                      const isSelected = paymentMethod === pm;
                      return (
                        <button
                          key={pm}
                          type="button"
                          onClick={() => {
                            setPaymentMethod(pm);
                            setIsPaymentMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium transition-colors ${
                            isSelected
                              ? 'bg-[#0058be]/10 text-[#0058be] font-semibold'
                              : 'text-text-primary hover:bg-bg-tertiary'
                          }`}
                        >
                          <span>{pm}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[16px] text-[#0058be]">
                              check
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1">
                Date
              </label>
              <input
                type="date"
                value={rawDate}
                onChange={(e) => setRawDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bg-tertiary rounded-2xl text-[13px] font-medium outline-none text-text-primary border border-transparent focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Add notes or description..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-bg-tertiary rounded-2xl text-[13px] outline-none focus:ring-2 focus:ring-[#0058be]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#000000] dark:bg-[#2170e4] text-white font-semibold rounded-full hover:opacity-90 transition-all active:scale-95 shadow-md mt-2"
          >
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};
