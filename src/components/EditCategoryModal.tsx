import React, { useState, useEffect } from 'react';
import { Category, CategoryId } from '../types';
import { CurrencyCode, getCurrency } from '../utils/currency';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/solid';
import { CategoryIcon, CATEGORY_ICONS_PRESET } from './ui/CategoryIcon';

interface EditCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  currency?: CurrencyCode;
  onClose: () => void;
  onEditCategory: (category: Category) => void;
}

const AVAILABLE_COLORS = [
  { color: '#9466ff', bgHex: '#9c27b0', label: 'Purple' },
  { color: '#2170e4', bgHex: '#2196f3', label: 'Blue' },
  { color: '#27AE60', bgHex: '#4caf50', label: 'Green' },
  { color: '#F39C12', bgHex: '#ff9800', label: 'Orange' },
  { color: '#E74C3C', bgHex: '#f44336', label: 'Red' },
  { color: '#00bcd4', bgHex: '#0097a7', label: 'Teal' },
  { color: '#e91e63', bgHex: '#c2185b', label: 'Pink' },
  { color: '#795548', bgHex: '#5d4037', label: 'Brown' },
];

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  category,
  currency = 'IDR',
  onClose,
  onEditCategory,
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('shopping_bag');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [budget, setBudget] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  useEffect(() => {
    if (category && isOpen) {
      setName(category.name);
      setSelectedIcon(category.icon);
      const colorIdx = AVAILABLE_COLORS.findIndex(c => c.color === category.color);
      setSelectedColorIdx(colorIdx !== -1 ? colorIdx : 0);
      setBudget(category.budget ? category.budget.toString() : '');
      setType(category.type || 'expense');
    }
  }, [category, isOpen]);

  const activeCur = getCurrency(currency as any);

  if (!isOpen || !category) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const colorObj = AVAILABLE_COLORS[selectedColorIdx];
    const budgetNum = budget ? parseFloat(budget) : undefined;

    onEditCategory({
      ...category,
      name: name.trim(),
      color: colorObj.color,
      bgHex: colorObj.bgHex,
      icon: selectedIcon,
      budget: budgetNum && !isNaN(budgetNum) ? budgetNum : undefined,
      type: type,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-bg-secondary rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border-color space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-text-primary">Edit Category</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary hover:bg-[#e1e8fd] transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Expense / Income Toggle */}
        <div className="flex bg-bg-tertiary p-1 rounded-2xl border border-border-color">
          <button
            type="button"
            onClick={() => setType('expense')}
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
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-[14px] font-semibold rounded-xl transition-all ${
              type === 'income'
                ? 'bg-[#27AE60] text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Coffee & Snacks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-tertiary rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-[#0058be]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              Monthly Budget Limit ({activeCur.symbol}) - Optional
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 500000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-tertiary rounded-2xl text-[14px] outline-none focus:ring-2 focus:ring-[#0058be]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              Select Icon ({CATEGORY_ICONS_PRESET.length} pilihan Scarlab & Heroicons)
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1.5 bg-bg-tertiary/50 rounded-2xl border border-border-color custom-scrollbar">
              {CATEGORY_ICONS_PRESET.map((iconItem) => (
                <button
                  key={iconItem.id}
                  type="button"
                  onClick={() => setSelectedIcon(iconItem.id)}
                  title={iconItem.label}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedIcon === iconItem.id
                      ? 'border-brand-primary bg-brand-primary/15 text-brand-primary shadow-xs ring-1 ring-brand-primary'
                      : 'border-border-color bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  }`}
                >
                  <CategoryIcon
                    category={{
                      id: 'preview',
                      name: '',
                      amount: 0,
                      color: AVAILABLE_COLORS[selectedColorIdx].color,
                      bgHex: AVAILABLE_COLORS[selectedColorIdx].bgHex,
                      icon: iconItem.id,
                    }}
                    size="sm"
                  />
                  <span className="text-[9px] font-medium truncate w-full text-center">
                    {iconItem.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              Select Color Theme
            </label>
            <div className="flex gap-2 overflow-x-auto p-1">
              {AVAILABLE_COLORS.map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColorIdx(idx)}
                  className={`w-8 h-8 rounded-full shrink-0 transition-all flex items-center justify-center ${
                    selectedColorIdx === idx ? 'ring-2 ring-offset-2 ring-brand-primary' : ''
                  }`}
                  style={{ backgroundColor: c.color }}
                >
                  {selectedColorIdx === idx && (
                    <CheckIcon className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:opacity-90 transition-all active:scale-95 shadow-md mt-2"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};