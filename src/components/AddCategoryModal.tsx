import React, { useState } from 'react';
import { Category } from '../types';
import { CurrencyCode, getCurrency } from '../utils/currency';

interface AddCategoryModalProps {
  isOpen: boolean;
  currency?: CurrencyCode;
  onClose: () => void;
  onAddCategory: (category: Category) => void;
}

const AVAILABLE_ICONS = [
  'shopping_bag',
  'directions_car',
  'event',
  'home',
  'restaurant',
  'flight',
  'fitness_center',
  'medical_services',
  'school',
  'pets',
  'sports_esports',
  'local_cafe',
  'payments',
  'work',
  'trending_up',
  'savings',
];

const AVAILABLE_COLORS = [
  { color: '#9466ff', bgHex: '#9c27b0' },
  { color: '#2170e4', bgHex: '#2196f3' },
  { color: '#27AE60', bgHex: '#4caf50' },
  { color: '#F39C12', bgHex: '#ff9800' },
  { color: '#E74C3C', bgHex: '#f44336' },
  { color: '#00bcd4', bgHex: '#0097a7' },
  { color: '#e91e63', bgHex: '#c2185b' },
  { color: '#795548', bgHex: '#5d4037' },
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  currency = 'IDR',
  onClose,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('shopping_bag');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [budget, setBudget] = useState('');

  const activeCur = getCurrency(currency as any);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = name.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const colorObj = AVAILABLE_COLORS[selectedColorIdx];
    const budgetNum = budget ? parseFloat(budget) : undefined;

    onAddCategory({
      id,
      name: name.trim(),
      amount: 0,
      color: colorObj.color,
      bgHex: colorObj.bgHex,
      icon: selectedIcon,
      budget: budgetNum && !isNaN(budgetNum) ? budgetNum : undefined,
    });

    setName('');
    setBudget('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-bg-secondary rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border-color space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-text-primary">New Category</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary hover:bg-[#e1e8fd]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
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
              Select Icon
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-2.5 rounded-2xl border flex items-center justify-center transition-all ${
                    selectedIcon === icon
                      ? 'border-[#2170e4] bg-[#2170e4]/10 text-[#0058be]'
                      : 'border-border-color bg-bg-tertiary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
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
                    selectedColorIdx === idx ? 'ring-2 ring-offset-2 ring-[#0058be]' : ''
                  }`}
                  style={{ backgroundColor: c.color }}
                >
                  {selectedColorIdx === idx && (
                    <span className="material-symbols-outlined text-white text-[16px]">check</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#000000] dark:bg-[#2170e4] text-white font-semibold rounded-full hover:opacity-90 transition-all active:scale-95 shadow-md mt-2"
          >
            Create Category
          </button>
        </form>
      </div>
    </div>
  );
};
