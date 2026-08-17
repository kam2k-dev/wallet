import React from 'react';
import { ViewTab, User } from '../types';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

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
          <ArrowLeftIcon className="w-5 h-5 text-text-primary" />
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
          <ArrowLeftIcon className="w-5 h-5 text-text-primary" />
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
          <ArrowLeftIcon className="w-5 h-5 text-text-primary" />
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
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M27 8H7a1 1 0 0 1 0-2h17a1 1 0 1 0 0-2H7a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h20a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2m-4.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
          </svg>
        </div>
        <h1 className="font-bold text-[20px] leading-[28px] text-text-primary tracking-tight">
          DompetKu
        </h1>
      </div>

      {user && (
        <button
          onClick={onProfileClick}
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2170e4] to-[#0051a8] text-white flex items-center justify-center text-[12px] font-bold shadow-sm hover:opacity-90 transition-all active-scale border border-white/20 overflow-hidden"
          title={user.name || 'Profile'}
        >
          {user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            userInitials
          )}
        </button>
      )}
    </header>
  );
};
