import React from 'react';
import { ViewTab } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  categoryTitle?: string;
  onBack?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  categoryTitle,
  onBack,
  onOpenNotifications,
}) => {
  if (currentTab === 'analysis') {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 w-full bg-[#f9f9ff]/90 backdrop-blur-md">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[#141b2b]">arrow_back</span>
        </button>
        <h1 className="font-semibold text-[20px] leading-[28px] text-[#141b2b]">Spend analysis</h1>
        <button
          aria-label="More options"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[#141b2b]">more_horiz</span>
        </button>
      </header>
    );
  }

  if (currentTab === 'wallet') {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 w-full bg-[#f9f9ff]/90 backdrop-blur-md">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[#141b2b]">arrow_back</span>
        </button>
        <h1 className="font-semibold text-[20px] leading-[28px] text-[#141b2b] tracking-tight">
          Wallet details
        </h1>
        <div className="flex items-center gap-1">
          <button
            aria-label="Add user"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[#141b2b]">person_add</span>
          </button>
          <button
            aria-label="More options"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-[#141b2b]">more_horiz</span>
          </button>
        </div>
      </header>
    );
  }

  if (currentTab === 'profile') {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 w-full bg-[#f9f9ff]/90 backdrop-blur-md">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[#141b2b]">arrow_back</span>
        </button>
        <h1 className="font-semibold text-[20px] leading-[28px] text-[#141b2b]">Profile & Account</h1>
        <button
          aria-label="More options"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[#141b2b]">more_horiz</span>
        </button>
      </header>
    );
  }

  // Default: Dashboard / Home
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 w-full bg-[#f9f9ff]/90 backdrop-blur-md">
      <button
        aria-label="Menu"
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
      >
        <span className="material-symbols-outlined text-[#141b2b]">menu</span>
      </button>
      <div className="flex items-center gap-2">
        <button
          aria-label="Support"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[#141b2b]">headphones</span>
        </button>
        <button
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95 relative"
        >
          <span className="material-symbols-outlined text-[#141b2b]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-[#f9f9ff]"></span>
        </button>
      </div>
    </header>
  );
};
