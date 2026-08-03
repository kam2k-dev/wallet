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
  const tabs = [
    {
      id: 'dashboard' as ViewTab,
      label: 'Home',
      iconOutline: 'grid_view',
      iconFilled: 'grid_view',
    },
    {
      id: 'wallet' as ViewTab,
      label: 'Wallet',
      iconOutline: 'wallet',
      iconFilled: 'wallet',
    },
    {
      id: 'add',
      label: 'Add',
      iconOutline: 'add',
      iconFilled: 'add',
      isSpecial: true,
    },
    {
      id: 'analysis' as ViewTab,
      label: 'Analytics',
      iconOutline: 'insights',
      iconFilled: 'insights',
    },
    {
      id: 'profile' as ViewTab,
      label: 'Profile',
      iconOutline: 'account_circle',
      iconFilled: 'account_circle',
    },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-full px-4">
      <nav className="ios-liquid-glass flex items-center justify-between px-3 py-1.5 rounded-full w-full max-w-[420px] mx-auto transition-all duration-300">
        {tabs.map((tab) => {
          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={onOpenAddModal}
                aria-label="Add transaction"
                className="relative group p-1.5 rounded-full active:scale-95 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#007aff] to-[#0051a8] text-white shadow-md shadow-[#007aff]/30 flex items-center justify-center border border-white/40 group-hover:scale-105 group-hover:shadow-[#007aff]/50 transition-all duration-300">
                  <span className="material-symbols-outlined text-[22px] font-bold transition-transform duration-300 group-hover:rotate-90">
                    add
                  </span>
                </div>
              </button>
            );
          }

          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as ViewTab)}
              aria-label={tab.label}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 active:scale-90 ${
                isActive
                  ? 'ios-liquid-item-active text-white'
                  : 'text-[#141b2b]/60 hover:text-[#141b2b] hover:bg-white/30'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-all duration-200 ${
                  isActive ? 'fill-1' : ''
                }`}
              >
                {isActive ? tab.iconFilled : tab.iconOutline}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

