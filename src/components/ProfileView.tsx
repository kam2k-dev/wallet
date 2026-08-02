import React from 'react';

export const ProfileView: React.FC = () => {
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

        <div className="flex items-center justify-between p-3 hover:bg-[#f9f9ff] rounded-2xl cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#0058be]">payments</span>
            <span className="text-[14px] font-medium text-[#141b2b]">Primary Currency</span>
          </div>
          <span className="text-[12px] text-[#77767b]">USD ($)</span>
        </div>

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
