import React, { useState } from 'react';
import { LayoutGrid, List, ChevronUp, ChevronDown } from 'lucide-react';
import { Category, Transaction, CategoryId } from '../types';
import { CurrencyCode, formatCurrency } from '../utils/currency';
import { EditCategoryModal } from './EditCategoryModal';

interface DashboardViewProps {
  categories: Category[];
  transactions: Transaction[];
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  currency: CurrencyCode;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onSeeAllTransactions: () => void;
  onAddCategory?: () => void;
  onDeleteCategory?: (categoryId: CategoryId) => void;
  onEditCategory?: (category: Category) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  categories,
  transactions,
  totalBalance,
  totalIncome,
  totalExpense,
  currency,
  onSelectCategory,
  onSelectTransaction,
  onSeeAllTransactions,
  onAddCategory,
  onDeleteCategory,
  onEditCategory,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('categoryViewMode') as 'grid' | 'list') || 'grid';
  });
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('categoryOrder');
    return saved ? JSON.parse(saved) : [];
  });
  const [hiddenCategories, setHiddenCategories] = useState<Set<CategoryId>>(() => {
    const saved = localStorage.getItem('hiddenCategories');
    // Default hidden categories for new users
    const defaultHidden: CategoryId[] = [
      'entertainment',
      'rent',
      'freelance',
      'other_income'
    ];
    return saved ? new Set(JSON.parse(saved)) : new Set(defaultHidden);
  });

  const [contextMenuState, setContextMenuState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    category: Category | null;
  }>({ visible: false, x: 0, y: 0, category: null });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const toggleCategoryVisibility = (id: CategoryId, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('hiddenCategories', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleToggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('categoryViewMode', mode);
  };

  const moveCategory = (id: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const currentOrder = visibleCategories.map(c => c.id);
    const index = currentOrder.indexOf(id as CategoryId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setCategoryOrder(newOrder);
    localStorage.setItem('categoryOrder', JSON.stringify(newOrder));
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenuState({ ...contextMenuState, visible: false });
    if (contextMenuState.visible) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenuState.visible]);

  // Take latest 5 transactions
  const latestTransactions = transactions.slice(0, 5);

  const formatAmount = (num: number) => formatCurrency(num, currency);

  const baseCategories = isEditMode 
    ? categories 
    : categories.filter(cat => !hiddenCategories.has(cat.id));

  // Order categories based on user custom order
  const visibleCategories = React.useMemo(() => {
    let list = [...baseCategories];

    if (categoryOrder.length > 0) {
      list.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a.id);
        const indexB = categoryOrder.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }

    return list;
  }, [baseCategories, categoryOrder]);

  // Group transactions by Relative Date (Today, Yesterday, Older)
  const groupedTransactions = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const groups: { [key: string]: Transaction[] } = {};

    latestTransactions.forEach((tx) => {
      let groupName = 'Riwayat Sebelumnya';
      if (tx.rawDate === todayStr) {
        groupName = 'Hari Ini';
      } else if (tx.rawDate === yesterdayStr) {
        groupName = 'Kemarin';
      } else if (tx.date) {
        groupName = tx.date;
      }

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(tx);
    });

    return groups;
  }, [latestTransactions]);

  return (
    <main className="px-5 space-y-6 pt-2 pb-28 max-w-md mx-auto">
      {/* Clean Swiss-Finance Minimalist Hero Card */}
      <section className="bg-bg-secondary p-5 sm:p-6 rounded-3xl border border-border-color shadow-xs transition-all space-y-5">
        
        {/* Top bar: Label & Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-text-secondary">
            Total Saldo
          </span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-text-secondary hover:text-text-primary p-1 -mr-1 transition-colors rounded-lg"
            title="Sembunyikan / Tampilkan Saldo"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showBalance ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        </div>

        {/* Hero Amount */}
        <div>
          <h1 className="font-bold text-[32px] sm:text-[36px] text-text-primary tracking-tight leading-none">
            {showBalance ? formatCurrency(totalBalance, currency) : '••••••••••••'}
          </h1>
        </div>

        {/* Crisp Income & Expense Columns */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-color">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-text-secondary text-[12px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60]" />
              <span>Pemasukan</span>
            </div>
            <p className="text-[15px] font-semibold text-[#27AE60] tracking-tight truncate">
              {showBalance ? formatCurrency(totalIncome, currency) : '••••'}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-text-secondary text-[12px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
              <span>Pengeluaran</span>
            </div>
            <p className="text-[15px] font-semibold text-[#ba1a1a] tracking-tight truncate">
              {showBalance ? formatCurrency(totalExpense, currency) : '••••'}
            </p>
          </div>
        </div>
      </section>

      {/* Category Section - Minimalist Surface Cards / List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[17px] text-text-primary">Kategori</h2>
          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle (Grid / List) - Only displayed during Edit Mode */}
            {isEditMode && (
              <div className="flex items-center bg-bg-secondary border border-border-color rounded-xl p-0.5 animate-fadeIn">
                <button
                  onClick={() => handleToggleViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-bg-primary text-text-primary shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Tampilan Grid"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => handleToggleViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-bg-primary text-text-primary shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Tampilan List"
                >
                  <List size={15} />
                </button>
              </div>
            )}

            {onAddCategory && (
              <button
                onClick={onAddCategory}
                title="Add Category"
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-[#007aff] hover:bg-bg-tertiary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>
            )}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              title={isEditMode ? 'Done' : 'Edit Categories'}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isEditMode
                  ? 'bg-text-primary text-bg-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isEditMode ? 'check' : 'edit'}
              </span>
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {visibleCategories.map((cat, index) => {
              const isHidden = hiddenCategories.has(cat.id);
              const budgetLimit = cat.budget || 1000000;
              const budgetPct = Math.min(100, Math.round((cat.amount / budgetLimit) * 100));

              return (
                <div
                  key={cat.id}
                  onClick={() => !isEditMode && onSelectCategory(cat.id)}
                  onContextMenu={(e) => {
                    if (isEditMode && onDeleteCategory) {
                      e.preventDefault();
                      setContextMenuState({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                        category: cat,
                      });
                    }
                  }}
                  className={`p-3.5 rounded-2xl bg-bg-secondary border border-border-color flex flex-col justify-between h-[116px] transition-all shadow-xs relative group ${
                    !isEditMode ? 'cursor-pointer hover:border-[#007aff]/40 hover:shadow-sm active:scale-[0.98]' : 'cursor-default'
                  } ${isEditMode && isHidden ? 'opacity-40 grayscale' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.bgHex }}
                    >
                      <span className="material-symbols-outlined text-[17px]">{cat.icon}</span>
                    </div>
                    {isEditMode ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => moveCategory(cat.id, 'up', e)}
                          disabled={index === 0}
                          title="Geser ke kiri/atas"
                          className="w-6 h-6 rounded-md bg-bg-primary border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          onClick={(e) => moveCategory(cat.id, 'down', e)}
                          disabled={index === visibleCategories.length - 1}
                          title="Geser ke kanan/bawah"
                          className="w-6 h-6 rounded-md bg-bg-primary border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          onClick={(e) => toggleCategoryVisibility(cat.id, e)}
                          className="w-6 h-6 rounded-md bg-bg-primary border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors ml-0.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isHidden ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-text-secondary/70">
                        {budgetPct}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-auto">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-[12px] font-medium text-text-secondary truncate">{cat.name}</p>
                    </div>
                    <p className="font-bold text-[14px] text-text-primary tracking-tight truncate leading-tight">
                      {formatCurrency(cat.amount, currency)}
                    </p>
                    
                    {/* Subtle Clean Budget Bar */}
                    <div className="w-full bg-bg-tertiary h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${budgetPct}%`,
                          backgroundColor: cat.bgHex
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2.5">
            {visibleCategories.map((cat, index) => {
              const isHidden = hiddenCategories.has(cat.id);
              const budgetLimit = cat.budget || 1000000;
              const budgetPct = Math.min(100, Math.round((cat.amount / budgetLimit) * 100));

              return (
                <div
                  key={cat.id}
                  onClick={() => !isEditMode && onSelectCategory(cat.id)}
                  onContextMenu={(e) => {
                    if (isEditMode && onDeleteCategory) {
                      e.preventDefault();
                      setContextMenuState({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                        category: cat,
                      });
                    }
                  }}
                  className={`p-3 rounded-2xl bg-bg-secondary border border-border-color flex items-center justify-between gap-3 transition-all shadow-xs relative group ${
                    !isEditMode ? 'cursor-pointer hover:border-[#007aff]/40 hover:shadow-sm active:scale-[0.99]' : 'cursor-default'
                  } ${isEditMode && isHidden ? 'opacity-40 grayscale' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.bgHex }}
                    >
                      <span className="material-symbols-outlined text-[19px]">{cat.icon}</span>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-bold text-text-primary truncate">{cat.name}</p>
                        <span className="text-[11px] font-semibold text-text-secondary">
                          {budgetPct}%
                        </span>
                      </div>
                      
                      <div className="w-full bg-bg-tertiary h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${budgetPct}%`,
                            backgroundColor: cat.bgHex
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-bold text-[14px] text-text-primary tracking-tight">
                      {formatCurrency(cat.amount, currency)}
                    </p>

                    {isEditMode && (
                      <div className="flex items-center gap-1 pl-1 border-l border-border-color">
                        <button
                          onClick={(e) => moveCategory(cat.id, 'up', e)}
                          disabled={index === 0}
                          title="Geser ke atas"
                          className="w-6 h-6 rounded-md bg-bg-primary border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={13} />
                        </button>
                        <button
                          onClick={(e) => moveCategory(cat.id, 'down', e)}
                          disabled={index === visibleCategories.length - 1}
                          title="Geser ke bawah"
                          className="w-6 h-6 rounded-md bg-bg-primary border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={13} />
                        </button>
                        <button
                          onClick={(e) => toggleCategoryVisibility(cat.id, e)}
                          className="w-6 h-6 rounded-md bg-bg-primary border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isHidden ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Grouped Timeline Latest Transactions */}
      <section className="space-y-3 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[17px] text-text-primary">Transaksi Terkini</h2>
          <button
            onClick={onSeeAllTransactions}
            title="Lihat semua transaksi"
            className="text-xs font-semibold text-[#007aff] hover:underline flex items-center gap-0.5"
          >
            <span>Semua</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        <div className="space-y-4">
          {latestTransactions.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-[13px] bg-bg-secondary rounded-2xl border border-border-color">
              Belum ada transaksi. Ketuk + untuk menambahkan!
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([dateLabel, items]) => (
              <div key={dateLabel} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007aff]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    {dateLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  {items.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    return (
                      <div
                        key={tx.id}
                        onClick={() => onSelectTransaction(tx)}
                        className="flex items-center gap-3.5 bg-bg-secondary p-3 rounded-2xl shadow-sm border border-border-color transition-all duration-200 cursor-pointer hover:shadow-md hover:border-[#007aff]/30 active:scale-[0.99]"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: cat?.bgHex || '#007aff' }}
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            {cat?.icon || 'receipt'}
                          </span>
                        </div>

                        <div className="flex-grow min-w-0">
                          <p className="text-[13px] font-bold text-text-primary truncate">{tx.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-bg-tertiary rounded-md text-text-secondary">
                              {tx.paymentMethod}
                            </span>
                            <span className="text-[11px] text-text-secondary truncate">
                              {cat?.name}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={`text-[14px] font-black ${
                              tx.amount < 0 ? 'text-[#ba1a1a]' : 'text-[#27AE60]'
                            }`}
                          >
                            {formatAmount(tx.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      {/* Context Menu for Edit Mode */}
      {contextMenuState.visible && (
        <div
          className="fixed z-50 bg-bg-secondary border border-border-color shadow-lg rounded-xl overflow-hidden py-1 min-w-[120px]"
          style={{ top: contextMenuState.y, left: contextMenuState.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
            onClick={() => {
              setEditingCategory(contextMenuState.category);
              setIsEditModalOpen(true);
              setContextMenuState({ ...contextMenuState, visible: false });
            }}
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#ba1a1a]/10 flex items-center gap-2 transition-colors"
            onClick={() => {
              if (onDeleteCategory && contextMenuState.category) {
                onDeleteCategory(contextMenuState.category.id);
              }
              setContextMenuState({ ...contextMenuState, visible: false });
            }}
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete
          </button>
        </div>
      )}

      {/* Edit Category Modal */}
      {onEditCategory && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          category={editingCategory}
          currency={currency}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCategory(null);
          }}
          onEditCategory={onEditCategory}
        />
      )}
    </main>
  );
};
