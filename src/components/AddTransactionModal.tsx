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
      {/* Soft Ambient Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container: Matching iOS / DompetKu Card Aesthetics */}
      <div className="relative w-full max-w-md bg-bg-secondary/90 dark:bg-[#1a1c23]/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-border-color dark:border-white/10 flex flex-col max-h-[92vh] overflow-hidden transition-all duration-300">
        
        {/* Header matching Dashboard aesthetic */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-border-color">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${
              type === 'expense' ? 'bg-[#ba1a1a]' : 'bg-[#27AE60]'
            }`} />
            <h2 className="text-[17px] font-bold text-text-primary tracking-tight">
              {initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-primary hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-all active:scale-95 border border-border-color"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          
          {/* Segmented Switcher matching BottomNav & Dashboard styling */}
          <div className="bg-bg-primary p-1 rounded-2xl border border-border-color grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('groceries');
              }}
              className={`py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-[#ba1a1a] text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/60'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${type === 'expense' ? 'bg-white/20' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'}`}>
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              </div>
              <span>Pengeluaran</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('salary');
              }}
              className={`py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-[#27AE60] text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/60'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${type === 'income' ? 'bg-white/20' : 'bg-[#27AE60]/10 text-[#27AE60]'}`}>
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              </div>
              <span>Pemasukan</span>
            </button>
          </div>

          <form id="tx-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Amount Card matching Dashboard's Total Balance card */}
            <div className="bg-bg-primary p-4 rounded-2xl border border-border-color text-center space-y-1">
              <span className="text-[12px] font-medium text-text-secondary block">
                Nominal ({activeCur.symbol})
              </span>
              <div className="flex items-center justify-center gap-1">
                <span className={`text-2xl font-bold ${type === 'expense' ? 'text-[#ba1a1a]' : 'text-[#27AE60]'}`}>
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
                  className="w-full max-w-[260px] bg-transparent text-[32px] sm:text-[36px] font-bold text-text-primary text-center outline-none tracking-tight placeholder:text-text-secondary/30"
                />
              </div>
            </div>

            {/* Title / Description */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-secondary px-0.5">
                Judul Transaksi
              </label>
              <input
                type="text"
                required
                placeholder="Cth: Belanja Mingguan, Gaji Bulanan..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bg-primary rounded-xl text-[14px] font-normal text-text-primary outline-none border border-border-color focus:border-[#007aff] focus:ring-1 focus:ring-[#007aff] transition-all placeholder:text-text-secondary/40"
              />
            </div>

            {/* Category Grid */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-secondary px-0.5">
                Kategori
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-0.5 custom-scrollbar">
                {filteredCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2.5 rounded-2xl text-left flex items-center gap-2.5 transition-all border ${
                        isSelected
                          ? 'border-[#007aff] bg-[#007aff]/10 ring-1 ring-[#007aff]'
                          : 'border-border-color bg-bg-primary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                      }`}
                    >
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.bgHex }}
                      >
                        <span className="material-symbols-outlined text-[17px]">{cat.icon || 'category'}</span>
                      </span>
                      <span className={`text-[13px] truncate ${isSelected ? 'text-text-primary font-semibold' : 'font-medium'}`}>
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method & Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Payment Method */}
              <div className="space-y-1.5 relative">
                <label className="text-[12px] font-medium text-text-secondary px-0.5">
                  Metode Pembayaran
                </label>
                <button
                  type="button"
                  onClick={() => setIsPaymentMenuOpen(!isPaymentMenuOpen)}
                  className={`w-full px-3.5 py-2.5 bg-bg-primary rounded-xl text-[13px] font-medium text-text-primary flex items-center justify-between border transition-all ${
                    isPaymentMenuOpen
                      ? 'border-[#007aff] ring-1 ring-[#007aff]'
                      : 'border-border-color hover:border-text-secondary/40'
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
                    <div className="absolute left-0 right-0 bottom-[calc(100%+6px)] max-h-48 overflow-y-auto bg-bg-secondary/95 backdrop-blur-xl rounded-2xl border border-border-color shadow-xl p-1 z-50 space-y-0.5 custom-scrollbar">
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
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                              isSelected
                                ? 'bg-[#007aff]/10 text-[#007aff] font-semibold'
                                : 'text-text-primary hover:bg-bg-primary'
                            }`}
                          >
                            <span>{pm}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-[#007aff]">check</span>
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
                <label className="text-[12px] font-medium text-text-secondary px-0.5">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={rawDate}
                  onChange={(e) => setRawDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-bg-primary rounded-xl text-[13px] font-medium text-text-primary outline-none border border-border-color focus:border-[#007aff] focus:ring-1 focus:ring-[#007aff] transition-all"
                />
              </div>
            </div>

            {/* Notes Input */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-text-secondary px-0.5">
                Catatan <span className="text-text-secondary/50 font-normal">(Opsional)</span>
              </label>
              <textarea
                placeholder="Tuliskan catatan tambahan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 bg-bg-primary rounded-xl text-[13px] text-text-primary outline-none focus:ring-1 focus:ring-[#007aff] border border-border-color focus:border-[#007aff] transition-all resize-none placeholder:text-text-secondary/40"
              />
            </div>
          </form>
        </div>

        {/* Footer / Submit Button matching app's main action button & liquid theme */}
        <div className="p-4 sm:p-5 bg-bg-secondary border-t border-border-color">
          <button
            type="submit"
            form="tx-form"
            className={`w-full py-3 rounded-2xl text-white text-[14px] font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
              type === 'expense'
                ? 'bg-[#ba1a1a] hover:bg-[#a01616]'
                : 'bg-[#27AE60] hover:bg-[#219653]'
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
