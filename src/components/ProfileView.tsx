import React, { useState } from 'react';
import { CURRENCIES, CurrencyCode, getCurrency } from '../utils/currency';
import { FALLBACK_RATES } from '../utils/exchangeRate';

interface ProfileViewProps {
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onCurrencyChange: (code: CurrencyCode) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currency,
  rates = FALLBACK_RATES,
  onCurrencyChange,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const activeCurrency = getCurrency(currency);

  return (
    <main className="max-w-md mx-auto px-5 pt-4 space-y-6 pb-28">
      {/* Profile Header */}
      <section className="bg-bg-secondary p-6 rounded-3xl border border-border-color shadow-sm text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#2170e4] to-[#9466ff] text-white flex items-center justify-center text-[28px] font-bold mx-auto shadow-md">
          JD
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-text-primary">John Doe</h2>
          <p className="text-[14px] text-text-secondary">john.doe@example.com</p>
        </div>
      </section>

      {/* Account Preferences */}
      <section className="bg-bg-secondary rounded-3xl p-4 border border-border-color shadow-sm space-y-1">
        <h3 className="text-[14px] font-bold text-text-secondary px-2 py-1">Preferences</h3>

        <div
          onClick={() => setIsCurrencyPickerOpen(!isCurrencyPickerOpen)}
          className="flex items-center justify-between p-3 hover:bg-bg-primary rounded-2xl cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">payments</span>
            <span className="text-[14px] font-medium text-text-primary">Primary Currency</span>
          </div>
          <span className="text-[12px] text-[#77767b]">
            {activeCurrency.code} ({activeCurrency.symbol})
          </span>
        </div>

        {/* Currency Picker */}
        {isCurrencyPickerOpen && (
          <div className="mx-2 mb-2 p-2 bg-bg-primary rounded-2xl border border-border-color space-y-1 animate-in fade-in">
            <div className="px-3 py-1.5 text-[11px] font-medium text-[#77767b] flex justify-between items-center border-b border-border-color mb-1">
              <span>Real-time conversion rates</span>
              <span className="text-[10px] text-[#2170e4] font-semibold">● Live Exchange</span>
            </div>
            {CURRENCIES.map((cur) => {
              const rateVal = rates[cur.code] || 1;
              return (
                <button
                  key={cur.code}
                  onClick={() => {
                    onCurrencyChange(cur.code);
                    setIsCurrencyPickerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    currency === cur.code
                      ? 'bg-[#2170e4]/10 border border-[#2170e4]/30'
                      : 'hover:bg-bg-secondary border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${
                        currency === cur.code
                          ? 'bg-[#2170e4] text-white'
                          : 'bg-[#e1e8fd] text-text-secondary'
                      }`}
                    >
                      {cur.symbol}
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-text-primary">
                        {cur.code}
                      </span>
                      <span className="block text-[11px] text-[#77767b]">
                        {cur.label} • 1 USD = {cur.symbol}{rateVal.toLocaleString()}
                      </span>
                    </span>
                  </span>
                  {currency === cur.code && (
                    <span className="material-symbols-outlined text-[#2170e4] text-[18px]">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div 
          onClick={onToggleDarkMode}
          className="flex items-center justify-between p-3 hover:bg-bg-primary rounded-2xl cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">
              {isDarkMode ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="text-[14px] font-medium text-text-primary">Dark Mode</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-[#2170e4]' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 rounded-full bg-bg-secondary transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>
      </section>

      {/* App Info */}
      <section className="bg-bg-secondary rounded-3xl p-4 border border-border-color shadow-sm space-y-1">
        <h3 className="text-[14px] font-bold text-text-secondary px-2 py-1">App Info</h3>

        <div className="flex items-center justify-between p-3 hover:bg-bg-primary rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">info</span>
            <span className="text-[14px] font-medium text-text-primary">Version</span>
          </div>
          <span className="text-[12px] text-[#77767b]">v2.4.0</span>
        </div>
      </section>
    </main>
  );
};
