import React from 'react';
import { ViewTab, User } from '../types';

interface HeaderProps {
  currentTab: ViewTab;
  categoryTitle?: string;
  onBack?: () => void;
  user?: User | null;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  categoryTitle,
  onBack,
  user,
  onProfileClick,
}) => {
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'WA';

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
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2170e4] to-[#0051a8] flex items-center justify-center text-white shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-8 8H5a2 2 0 0 1-2-2V7" />
            <path d="M16 14h.01" />
          </svg>
        </div>
        <h1 className="font-bold text-[20px] leading-[28px] text-text-primary tracking-tight">
          DompetKu
        </h1>
      </div>

      {user && (
        <button
          onClick={onProfileClick}
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white flex items-center justify-center text-[12px] font-bold shadow-sm hover:opacity-90 transition-all active-scale border border-white/20"
          title={user.name || 'Profile'}
        >
          {userInitials}
        </button>
      )}
    </header>
  );
};
