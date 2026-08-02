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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <nav className="ios-liquid-glass flex items-center justify-between px-3 py-2 rounded-full w-[360px] max-w-[94vw] transition-all duration-300">
        {tabs.map((tab) => {
          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={onOpenAddModal}
                aria-label="Add transaction"
                className="relative group p-2.5 rounded-full active:scale-95 transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#007aff] to-[#0051a8] text-white shadow-lg shadow-[#007aff]/30 flex items-center justify-center border border-white/40 group-hover:scale-105 group-hover:shadow-[#007aff]/50 transition-all duration-300">
                  <span className="material-symbols-outlined text-[26px] font-bold transition-transform duration-300 group-hover:rotate-90">
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
              className={`relative flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-300 active:scale-90 ${
                isActive
                  ? 'ios-liquid-item-active text-white scale-105 shadow-md'
                  : 'text-[#141b2b]/60 hover:text-[#141b2b] hover:bg-white/30'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-all duration-200 ${
                  isActive ? 'fill-1 scale-110' : ''
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

