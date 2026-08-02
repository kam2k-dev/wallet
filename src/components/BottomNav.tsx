import React from 'react';
import { ViewTab } from '../types';

interface BottomNavProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-around px-4 py-2 w-[340px] max-w-[95vw] bg-[#000000] rounded-full shadow-2xl transition-all duration-300">
      {/* Home / Dashboard */}
      <button
        onClick={() => onTabChange('dashboard')}
        aria-label="Home Dashboard"
        className={`p-3 transition-all duration-200 active:scale-90 rounded-full ${
          currentTab === 'dashboard'
            ? 'bg-[#2170e4] text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            currentTab === 'dashboard' ? 'fill-1' : ''
          }`}
        >
          home
        </span>
      </button>

      {/* Wallet Details */}
      <button
        onClick={() => onTabChange('wallet')}
        aria-label="Wallet Details"
        className={`p-3 transition-all duration-200 active:scale-90 rounded-full ${
          currentTab === 'wallet'
            ? 'bg-[#2170e4] text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            currentTab === 'wallet' ? 'fill-1' : ''
          }`}
        >
          account_balance_wallet
        </span>
      </button>

      {/* Add Button */}
      <button
        onClick={onOpenAddModal}
        aria-label="Add transaction"
        className="text-white/70 hover:text-white p-3 transition-all duration-200 active:scale-90 hover:bg-white/10 rounded-full"
      >
        <span className="material-symbols-outlined text-[22px]">add</span>
      </button>

      {/* Spend Analysis */}
      <button
        onClick={() => onTabChange('analysis')}
        aria-label="Spend Analysis"
        className={`p-3 transition-all duration-200 active:scale-90 rounded-full ${
          currentTab === 'analysis'
            ? 'bg-[#2170e4] text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            currentTab === 'analysis' ? 'fill-1' : ''
          }`}
        >
          pie_chart
        </span>
      </button>

      {/* Profile */}
      <button
        onClick={() => onTabChange('profile')}
        aria-label="Profile"
        className={`p-3 transition-all duration-200 active:scale-90 rounded-full ${
          currentTab === 'profile'
            ? 'bg-[#2170e4] text-white shadow-md'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span
          className={`material-symbols-outlined text-[22px] ${
            currentTab === 'profile' ? 'fill-1' : ''
          }`}
        >
          person
        </span>
      </button>
    </nav>
  );
};
