import React, { useState } from 'react';
import { CURRENCIES, CurrencyCode, getCurrency } from '../utils/currency';
import { FALLBACK_RATES } from '../utils/exchangeRate';
import { User } from '../types';

// Official WhatsApp SVG Icon Component
const WhatsAppIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 14,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ProfileViewProps {
  user?: User | null;
  onLogout?: () => void;
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onCurrencyChange: (code: CurrencyCode) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onExportCSV?: () => void;
  onExportJSON?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLogout,
  currency,
  rates = FALLBACK_RATES,
  onCurrencyChange,
  isDarkMode,
  onToggleDarkMode,
  onExportCSV,
  onExportJSON,
}) => {
  const [isCurrencyPickerOpen, setIsCurrencyPickerOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const activeCurrency = getCurrency(currency);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'WA';

  return (
    <main className="max-w-md mx-auto px-5 pt-4 space-y-5 pb-28">
      {/* Profile Header */}
      <section className="bg-bg-secondary p-6 rounded-3xl border border-border-color shadow-sm text-center space-y-3 relative overflow-hidden">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-full mx-auto shadow-md border-2 border-[#2170e4]"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#2170e4] to-[#0058be] text-white flex items-center justify-center text-[26px] font-bold mx-auto shadow-md shadow-[#2170e4]/20">
            {userInitials}
          </div>
        )}
        <div>
          <h2 className="text-[20px] font-bold text-text-primary">
            {user?.name || 'Tamu'}
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2170e4]/10 border border-[#2170e4]/20 text-[#2170e4] text-[12px] font-medium mt-1">
            <span className="material-symbols-outlined text-[14px]">mail</span>
            <span>{user?.email || 'Belum Terhubung'}</span>
          </div>
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

      {/* Data Management & Export */}
      <section className="bg-bg-secondary rounded-3xl p-4 border border-border-color shadow-sm space-y-1">
        <h3 className="text-[14px] font-bold text-text-secondary px-2 py-1">Data & Backup</h3>

        {onExportCSV && (
          <div
            onClick={onExportCSV}
            className="flex items-center justify-between p-3 hover:bg-bg-primary rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#27AE60]">table_view</span>
              <span className="text-[14px] font-medium text-text-primary">Export to CSV</span>
            </div>
            <span className="material-symbols-outlined text-text-secondary text-[18px]">download</span>
          </div>
        )}

        {onExportJSON && (
          <div
            onClick={onExportJSON}
            className="flex items-center justify-between p-3 hover:bg-bg-primary rounded-2xl cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00bcd4]">data_object</span>
              <span className="text-[14px] font-medium text-text-primary">Backup Data (JSON)</span>
            </div>
            <span className="material-symbols-outlined text-text-secondary text-[18px]">download</span>
          </div>
        )}
      </section>

      {/* Account Actions / Logout */}
      {onLogout && (
        <section className="bg-bg-secondary rounded-3xl p-4 border border-border-color shadow-sm space-y-2">
          <h3 className="text-[14px] font-bold text-text-secondary px-2 py-1">Account</h3>

          {showLogoutConfirm ? (
            <div className="p-3 bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 rounded-2xl space-y-3 animate-in fade-in">
              <p className="text-[13px] font-medium text-[#ba1a1a] text-center">
                Apakah Anda yakin ingin keluar dari akun ini?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-bg-secondary text-text-primary text-[13px] font-medium border border-border-color active-scale"
                >
                  Batal
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 py-2 rounded-xl bg-[#ba1a1a] text-white text-[13px] font-semibold active-scale shadow-sm"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center justify-between p-3 hover:bg-[#ba1a1a]/10 rounded-2xl cursor-pointer text-[#ba1a1a] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ba1a1a]">logout</span>
                <span className="text-[14px] font-medium">Keluar dari Akun</span>
              </div>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </div>
          )}
        </section>
      )}

      {/* App Info */}
      <section className="bg-bg-secondary rounded-3xl p-4 border border-border-color shadow-sm space-y-1">
        <h3 className="text-[14px] font-bold text-text-secondary px-2 py-1">App Info</h3>

        <div className="flex items-center justify-between p-3 hover:bg-bg-primary rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">info</span>
            <span className="text-[14px] font-medium text-text-primary">Version</span>
          </div>
          <span className="text-[12px] text-[#77767b]">v2.5.0</span>
        </div>
      </section>
    </main>
  );
};
