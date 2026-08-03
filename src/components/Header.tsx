import React, { useState } from 'react';
import { ViewTab } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  categoryTitle?: string;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  categoryTitle,
  onBack,
}) => {
  if (currentTab === 'analysis') {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 w-full bg-bg-primary/90 backdrop-blur-md">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-text-primary">arrow_back</span>
        </button>
        <h1 className="font-semibold text-[20px] leading-[28px] text-text-primary">Spend analysis</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </header>
    );
  }

  if (currentTab === 'wallet') {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 w-full bg-bg-primary/90 backdrop-blur-md">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-text-primary">arrow_back</span>
        </button>
        <h1 className="font-semibold text-[20px] leading-[28px] text-text-primary tracking-tight">
          Wallet details
        </h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </header>
    );
  }

  if (currentTab === 'profile') {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 w-full bg-bg-primary/90 backdrop-blur-md">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-text-primary">arrow_back</span>
        </button>
        <h1 className="font-semibold text-[20px] leading-[28px] text-text-primary">Profile & Account</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </header>
    );
  }

  // Default: Dashboard / Home
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 w-full bg-bg-primary/90 backdrop-blur-md">
      <h1 className="font-bold text-[20px] leading-[28px] text-text-primary tracking-tight">
        DompetKu
      </h1>
    </header>
  );
};
