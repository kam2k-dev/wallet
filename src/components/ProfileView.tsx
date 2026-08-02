import React, { useState } from 'react';
import { CURRENCIES, CurrencyCode, getCurrency } from '../utils/currency';
import { FALLBACK_RATES } from '../utils/exchangeRate';

interface ProfileViewProps {
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onCurrencyChange: (code: CurrencyCode) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currency,
  rates = FALLBACK_RATES,
  onCurrencyChange,
}) => {
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const activeCurrency = getCurrency(currency);

  return (
    <main className="max-w-md mx-auto px-5 pt-4 space-y-6 pb-28">
      {/* Profile Header */}
      <section className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#2170e4] to-[#9466ff] text-white flex items-center justify-center text-[28px] font-bold mx-auto shadow-md">
          JD
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-[#141b2b]">John Doe</h2>
          <p className="text-[14px] text-[#47464b]">john.doe@example.com</p>
        </div>
        <div className="inline-block bg-[#e9edff] text-[#0058be] text-[12px] font-semibold px-3 py-1 rounded-full">
          Premium Account
        </div>
      </section>

      {/* Account Preferences */}
      <section className="bg-white rounded-3xl p-4 border border-black/5 shadow-sm space-y-1">
        <h3 className="text-[14px] font-bold text-[#47464b] px-2 py-1">Preferences</h3>

        <div className="flex items-center justify-between p-3 hover:bg-[#f9f9ff] rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">account_balance</span>
            <span className="text-[14px] font-medium text-[#141b2b]">Linked Bank Accounts</span>
          </div>
          <span className="text-[12px] text-[#77767b]">2 Connected</span>
        </div>

        <div
          onClick={() => setIsCurrencyPickerOpen(!isCurrencyPickerOpen)}
          className="flex items-center justify-between p-3 hover:bg-[#f9f9ff] rounded-2xl cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">payments</span>
            <span className="text-[14px] font-medium text-[#141b2b]">Primary Currency</span>
          </div>
          <span className="text-[12px] text-[#77767b]">
            {activeCurrency.code} ({activeCurrency.symbol})
          </span>
        </div>

        {/* Currency Picker */}
        {isCurrencyPickerOpen && (
          <div className="mx-2 mb-2 p-2 bg-[#f9f9ff] rounded-2xl border border-black/5 space-y-1 animate-in fade-in">
            <div className="px-3 py-1.5 text-[11px] font-medium text-[#77767b] flex justify-between items-center border-b border-black/5 mb-1">
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
                      : 'hover:bg-white border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${
                        currency === cur.code
                          ? 'bg-[#2170e4] text-white'
                          : 'bg-[#e1e8fd] text-[#47464b]'
                      }`}
                    >
                      {cur.symbol}
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-[#141b2b]">
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

        <div className="flex items-center justify-between p-3 hover:bg-[#f9f9ff] rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">security</span>
            <span className="text-[14px] font-medium text-[#141b2b]">Security & Biometrics</span>
          </div>
          <span className="material-symbols-outlined text-[#77767b] text-[18px]">chevron_right</span>
        </div>
      </section>

      {/* App Info */}
      <section className="bg-white rounded-3xl p-4 border border-black/5 shadow-sm space-y-1">
        <h3 className="text-[14px] font-bold text-[#47464b] px-2 py-1">App Info</h3>

        <div className="flex items-center justify-between p-3 hover:bg-[#f9f9ff] rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">smart_toy</span>
            <span className="text-[14px] font-medium text-[#141b2b]">AI Smart Categorizer</span>
          </div>
          <span className="text-[12px] text-[#27AE60] font-semibold">Active</span>
        </div>

        <div className="flex items-center justify-between p-3 hover:bg-[#f9f9ff] rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">info</span>
            <span className="text-[14px] font-medium text-[#141b2b]">Version</span>
          </div>
          <span className="text-[12px] text-[#77767b]">v2.4.0</span>
        </div>
      </section>
    </main>
  );
};
