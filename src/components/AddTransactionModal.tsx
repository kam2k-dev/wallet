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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Dynamic blurred backdrop based on type */}
      <div 
        className={`absolute inset-0 backdrop-blur-md transition-colors duration-300 ${
          type === 'expense' ? 'bg-[#ba1a1a]/20' : 'bg-[#27AE60]/20'
        }`}
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-bg-secondary/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/20 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header Section */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-border-color/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
              type === 'expense' 
                ? 'bg-gradient-to-br from-[#ba1a1a] to-[#8c1313]' 
                : 'bg-gradient-to-br from-[#27AE60] to-[#1e8449]'
            }`}>
              <span className="material-symbols-outlined text-[22px]">
                {type === 'expense' ? 'money_off' : 'attach_money'}
              </span>
            </div>
            <h2 className="text-[20px] font-extrabold text-text-primary tracking-tight">
              {initialData ? 'Edit Data' : 'Transaksi Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-bg-primary hover:bg-[#ba1a1a]/10 hover:text-[#ba1a1a] flex items-center justify-center text-text-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Expense / Income Toggle */}
          <div className="flex bg-bg-primary p-1.5 rounded-[20px] border border-border-color/50 mb-6 relative shadow-inner">
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-2xl transition-all duration-300 shadow-sm ${
                type === 'expense' 
                  ? 'bg-gradient-to-r from-[#ba1a1a] to-[#db3e3e] left-1.5' 
                  : 'bg-gradient-to-r from-[#27AE60] to-[#2ecc71] left-[calc(50%+4px)]'
              }`}
            />
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('groceries');
              }}
              className={`flex-1 py-3 text-[14px] font-bold rounded-2xl transition-colors relative z-10 ${
                type === 'expense' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('salary');
              }}
              className={`flex-1 py-3 text-[14px] font-bold rounded-2xl transition-colors relative z-10 ${
                type === 'income' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Pemasukan
            </button>
          </div>

          <form id="tx-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Input Amount */}
            <div className="bg-bg-primary rounded-3xl p-4 border border-border-color/50 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                type === 'expense' ? 'bg-[#ba1a1a]' : 'bg-[#27AE60]'
              }`} />
              <label className="block text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2 ml-2">
                Nominal ({activeCur.symbol})
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
                className="w-full px-2 bg-transparent text-[36px] font-extrabold text-text-primary outline-none placeholder:text-text-secondary/30"
              />
            </div>

            {/* Input Details */}
            <div className="bg-bg-primary rounded-3xl p-4 border border-border-color/50 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                  Nama Transaksi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cth: Makan Siang, Gaji..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg-secondary rounded-2xl text-[14px] font-medium text-text-primary outline-none focus:ring-2 focus:ring-[#2170e4]/50 border border-transparent focus:border-[#2170e4] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                  Kategori
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                  {categories
                    .filter((cat) => {
                      if (cat.type) {
                        return cat.type === type;
                      }
                      return type === 'income' 
                        ? ['salary', 'freelance', 'investment', 'other_income'].includes(cat.id) 
                        : !['salary', 'freelance', 'investment', 'other_income'].includes(cat.id);
                    })
                    .map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2.5 rounded-2xl text-left flex items-center gap-2.5 transition-all border ${
                        categoryId === cat.id
                          ? 'ring-1'
                          : 'border-border-color bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
                      }`}
                      style={categoryId === cat.id ? { 
                        borderColor: cat.bgHex, 
                        backgroundColor: `${cat.bgHex}15`,
                        boxShadow: `0 0 0 1px ${cat.bgHex}4D`
                      } : {}}
                    >
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: cat.bgHex }}
                      >
                        <span className="material-symbols-outlined text-[16px]">{cat.icon || 'category'}</span>
                      </span>
                      <span className={`text-[12px] font-semibold truncate ${categoryId === cat.id ? 'text-text-primary' : ''}`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Custom Payment Method Dropdown */}
              <div className="bg-bg-primary rounded-3xl p-3.5 border border-border-color/50 relative">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                  Metode
                </label>
                <button
                  type="button"
                  onClick={() => setIsPaymentMenuOpen(!isPaymentMenuOpen)}
                  className={`w-full px-3 py-2.5 bg-bg-secondary rounded-2xl text-[13px] font-semibold text-text-primary flex items-center justify-between border transition-all ${
                    isPaymentMenuOpen
                      ? 'border-[#2170e4] ring-2 ring-[#2170e4]/20'
                      : 'border-transparent hover:border-border-color'
                  }`}
                >
                  <span className="truncate">{paymentMethod}</span>
                  <span className={`material-symbols-outlined text-[18px] text-text-secondary shrink-0 transition-transform duration-200 ${
                      isPaymentMenuOpen ? 'rotate-180' : ''
                    }`}>
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
                    <div className="absolute left-0 right-0 bottom-[calc(100%+8px)] max-h-48 overflow-y-auto bg-bg-secondary/95 backdrop-blur-xl rounded-2xl border border-border-color shadow-2xl p-1.5 z-50 space-y-0.5 animate-in slide-in-from-bottom-2 duration-200 custom-scrollbar">
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
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                              isSelected
                                ? 'bg-[#2170e4]/10 text-[#2170e4] font-bold'
                                : 'text-text-primary hover:bg-bg-primary'
                            }`}
                          >
                            <span>{pm}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px] text-[#2170e4]">check_circle</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-bg-primary rounded-3xl p-3.5 border border-border-color/50">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={rawDate}
                  onChange={(e) => setRawDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-bg-secondary rounded-2xl text-[13px] font-semibold outline-none text-text-primary border border-transparent focus:border-[#2170e4] focus:ring-2 focus:ring-[#2170e4]/20 transition-all"
                />
              </div>
            </div>

            <div className="bg-bg-primary rounded-3xl p-4 border border-border-color/50">
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                Catatan (Opsional)
              </label>
              <textarea
                placeholder="Tuliskan catatan tambahan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 bg-bg-secondary rounded-2xl text-[13px] outline-none focus:ring-2 focus:ring-[#2170e4]/50 border border-transparent focus:border-[#2170e4] transition-all resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer / Submit Button */}
        <div className="p-5 bg-bg-primary border-t border-border-color/50">
          <button
            type="submit"
            form="tx-form"
            className={`w-full py-4 rounded-[20px] text-white text-[15px] font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
              type === 'expense' 
                ? 'bg-gradient-to-r from-[#ba1a1a] to-[#db3e3e] hover:shadow-[#ba1a1a]/30' 
                : 'bg-gradient-to-r from-[#27AE60] to-[#2ecc71] hover:shadow-[#27AE60]/30'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {initialData ? 'save' : 'add_task'}
            </span>
            <span>{initialData ? 'Simpan Perubahan' : 'Tambahkan Transaksi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
