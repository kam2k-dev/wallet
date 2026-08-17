import React from 'react';
import { ViewTab } from '../types';
import {
  HomeIcon,
  WalletIcon,
  PlusIcon,
  ChartPieIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import {
  HomeIcon as HomeOutline,
  WalletIcon as WalletOutline,
  ChartPieIcon as ChartPieOutline,
  UserIcon as UserOutline,
} from '@heroicons/react/24/outline';

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
      OutlineIcon: HomeOutline,
      FilledIcon: HomeIcon,
    },
    {
      id: 'wallet' as ViewTab,
      label: 'Wallet',
      OutlineIcon: WalletOutline,
      FilledIcon: WalletIcon,
    },
    {
      id: 'add',
      label: 'Add',
      isSpecial: true,
    },
    {
      id: 'analysis' as ViewTab,
      label: 'Analytics',
      OutlineIcon: ChartPieOutline,
      FilledIcon: ChartPieIcon,
    },
    {
      id: 'profile' as ViewTab,
      label: 'Profile',
      OutlineIcon: UserOutline,
      FilledIcon: UserIcon,
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
                  <PlusIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 stroke-[2.5]" />
                </div>
              </button>
            );
          }

          const isActive = currentTab === tab.id;
          const IconComp = isActive ? tab.FilledIcon : tab.OutlineIcon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as ViewTab)}
              aria-label={tab.label}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 active:scale-90 ${
                isActive
                  ? 'ios-liquid-item-active text-white z-10'
                  : 'text-text-primary/60 hover:text-text-primary hover:bg-bg-secondary/30'
              }`}
            >
              {IconComp && <IconComp className="w-5 h-5 transition-all duration-200" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

