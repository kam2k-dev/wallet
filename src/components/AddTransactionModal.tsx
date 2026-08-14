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

  const filteredCategories = categories.filter((cat) => {
    if (cat.type) {
      return cat.type === type;
    }
    return type === 'income'
      ? ['salary', 'freelance', 'investment', 'other_income'].includes(cat.id)
      : !['salary', 'freelance', 'investment', 'other_income'].includes(cat.id);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Dimmed backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-bg-secondary/95 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/10 flex flex-col max-h-[92vh] overflow-hidden transition-all duration-300">
        
        {/* Sleek Minimalist Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-border-color/30">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            <h2 className="text-[17px] font-bold text-text-primary tracking-tight">
              {initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-primary/80 hover:bg-bg-primary flex items-center justify-center text-text-secondary hover:text-text-primary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          
          {/* Segmented Type Switcher */}
          <div className="bg-bg-primary p-1 rounded-2xl border border-border-color/40 grid grid-cols-2 gap-1 relative">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('groceries');
              }}
              className={`py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              Pengeluaran
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('salary');
              }}
              className={`py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              Pemasukan
            </button>
          </div>

          <form id="tx-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Hero Amount Input */}
            <div className="bg-bg-primary/80 rounded-2xl p-4 sm:p-5 border border-border-color/40 text-center transition-all focus-within:border-border-color">
              <span className="text-[11px] font-bold tracking-widest text-text-secondary uppercase block mb-1">
                Nominal ({activeCur.symbol})
              </span>
              <div className="flex items-center justify-center gap-1">
                <span className={`text-2xl font-bold ${type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {type === 'expense' ? '-' : '+'}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={amount ? Number(amount.replace(/,/g, '')).toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, '');
                    if (!isNaN(Number(rawValue))) {
                      setAmount(rawValue);
                    }
                  }}
                  className="w-full max-w-[280px] bg-transparent text-[36px] sm:text-[40px] font-extrabold text-text-primary text-center outline-none tracking-tight placeholder:text-text-secondary/20"
                />
              </div>
            </div>

            {/* Title / Description */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-text-secondary px-1">
                Judul Transaksi
              </label>
              <input
                type="text"
                required
                placeholder="Cth: Belanja Mingguan, Gaji Bulanan..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-bg-primary rounded-xl text-[14px] font-medium text-text-primary outline-none border border-border-color/40 focus:border-[#2170e4] focus:ring-2 focus:ring-[#2170e4]/15 transition-all placeholder:text-text-secondary/40"
              />
            </div>

            {/* Category Selector Grid */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-text-secondary px-1">
                Kategori
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1 custom-scrollbar">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2.5 rounded-xl text-left flex items-center gap-2.5 transition-all border ${
                        isSelected
                          ? 'border-[#2170e4] bg-[#2170e4]/10 ring-1 ring-[#2170e4]/30'
                          : 'border-border-color/30 bg-bg-primary text-text-secondary hover:bg-bg-primary/80 hover:text-text-primary'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.bgHex }}
                      >
                        <span className="material-symbols-outlined text-[15px]">{cat.icon || 'category'}</span>
                      </span>
                      <span className={`text-[12px] font-medium truncate ${isSelected ? 'text-text-primary font-semibold' : ''}`}>
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Payment Method */}
              <div className="space-y-1.5 relative">
                <label className="text-[12px] font-semibold text-text-secondary px-1">
                  Metode Pembayaran
                </label>
                <button
                  type="button"
                  onClick={() => setIsPaymentMenuOpen(!isPaymentMenuOpen)}
                  className={`w-full px-3.5 py-2.5 bg-bg-primary rounded-xl text-[13px] font-medium text-text-primary flex items-center justify-between border transition-all ${
                    isPaymentMenuOpen
                      ? 'border-[#2170e4] ring-2 ring-[#2170e4]/15'
                      : 'border-border-color/40 hover:border-border-color'
                  }`}
                >
                  <span className="truncate">{paymentMethod}</span>
                  <span className={`material-symbols-outlined text-[18px] text-text-secondary shrink-0 transition-transform duration-200 ${
                    isPaymentMenuOpen ? 'rotate-180' : ''
                  }`}>
                    expand_more
                  </span>
                </button>

                {/* Floating Payment Dropdown */}
                {isPaymentMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsPaymentMenuOpen(false)}
                    />
                    <div className="absolute left-0 right-0 bottom-[calc(100%+4px)] max-h-48 overflow-y-auto bg-bg-secondary/95 backdrop-blur-xl rounded-xl border border-border-color shadow-xl p-1 z-50 space-y-0.5 custom-scrollbar">
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
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                              isSelected
                                ? 'bg-[#2170e4]/10 text-[#2170e4] font-semibold'
                                : 'text-text-primary hover:bg-bg-primary'
                            }`}
                          >
                            <span>{pm}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-[#2170e4]">check</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-text-secondary px-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={rawDate}
                  onChange={(e) => setRawDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg-primary rounded-xl text-[13px] font-medium text-text-primary outline-none border border-border-color/40 focus:border-[#2170e4] focus:ring-2 focus:ring-[#2170e4]/15 transition-all"
                />
              </div>
            </div>

            {/* Notes Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-text-secondary px-1">
                Catatan <span className="text-text-secondary/50 font-normal">(Opsional)</span>
              </label>
              <textarea
                placeholder="Tuliskan catatan tambahan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-bg-primary rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#2170e4]/50 border border-transparent focus:border-[#2170e4] transition-all resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer / Submit Button */}
        <div className="p-4 sm:p-5 bg-bg-secondary border-t border-border-color/30">
          <button
            type="submit"
            form="tx-form"
            className={`w-full py-3.5 rounded-xl text-white text-[14px] font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] ${
              type === 'expense'
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {initialData ? 'save' : 'add'}
            </span>
            <span>{initialData ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
