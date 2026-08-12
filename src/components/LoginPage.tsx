import React, { useState, useEffect, useRef } from 'react';
import { AuthSession, User } from '../types';
import { api } from '../api/client';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

// Official WhatsApp SVG Icon Component
const WhatsAppIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 24,
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

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Countdown timer when session is active
  useEffect(() => {
    if (!session || session.status !== 'pending') return;

    setTimeLeft(Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000)));

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (pollingRef.current) clearInterval(pollingRef.current);
          setError('Sesi login telah berakhir. Silakan coba lagi.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session]);

  // Polling for session status
  useEffect(() => {
    if (!session || session.status !== 'pending') return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.checkWaAuthStatus(session.sessionId);
        if (res.success && res.status === 'verified' && res.user && res.token) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setIsSuccess(true);
          setTimeout(() => {
            onLoginSuccess(res.user!, res.token!);
          }, 1000);
        } else if (res.status === 'expired') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setError('Sesi login telah kedaluwarsa.');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [session, onLoginSuccess]);

  // 1-Click WhatsApp Login: Initiate session & immediately open WhatsApp
  const handleLoginWithWhatsApp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.initiateWaAuth();
      if (res.success && res.session) {
        setSession(res.session);
        // Automatically open WhatsApp in a new tab with pre-filled message
        window.open(res.session.waLink, '_blank', 'noopener,noreferrer');
      } else {
        setError('Gagal memulai sesi login WhatsApp.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const qrCodeUrl = session
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        session.waLink
      )}&color=141b2b&bgcolor=ffffff&margin=1`
    : '';

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      {/* Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#2170e4]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-[#25D366]/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-[#9466ff]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar */}
      <header className="w-full max-w-md mx-auto px-6 pt-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#2170e4] to-[#0051a8] flex items-center justify-center text-white shadow-md shadow-[#2170e4]/20">
            <svg width="19" height="19" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M27 8H7a1 1 0 0 1 0-2h17a1 1 0 1 0 0-2H7a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h20a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2m-4.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
            </svg>
          </div>
          <span className="text-[16px] font-bold tracking-tight">DompetKu</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="w-9 h-9 rounded-2xl bg-bg-secondary/80 backdrop-blur-md border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary transition-all active-scale shadow-sm"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto px-5 py-8 z-10 flex-1 flex flex-col justify-center">
        {/* Success State */}
        {isSuccess ? (
          <div className="ios-liquid-glass rounded-[32px] p-8 text-center space-y-4 animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mx-auto animate-bounce">
              <span className="material-symbols-outlined text-[44px]">check_circle</span>
            </div>
            <div className="space-y-1">
              <h2 className="text-[22px] font-bold text-text-primary">Login Berhasil!</h2>
              <p className="text-[13px] text-text-secondary">
                Membuka dashboard keuangan Anda...
              </p>
            </div>
            <div className="w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto mt-2" />
          </div>
        ) : !session ? (
          /* State 1: Clean & Modern 1-Click Login Card */
          <div className="ios-liquid-glass rounded-[32px] p-8 space-y-7 text-center relative overflow-hidden shadow-2xl border border-white/40 dark:border-white/10">
            {/* App Icon & Branding */}
            <div className="space-y-3">
              <div className="w-20 h-20 rounded-[26px] bg-gradient-to-tr from-[#25D366] via-[#1ebe5d] to-[#128C7E] text-white flex items-center justify-center mx-auto shadow-xl shadow-[#25D366]/25 animate-pulse-glow">
                <WhatsAppIcon size={42} />
              </div>
              <div className="space-y-1.5 pt-1">
                <h2 className="text-[24px] font-bold tracking-tight text-text-primary">
                  Selamat Datang
                </h2>
                <p className="text-[13px] text-text-secondary leading-relaxed max-w-[260px] mx-auto">
                  Kelola pengeluaran & keuangan Anda dengan mudah dan aman.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-[13px] flex items-center gap-2.5 text-left animate-in fade-in">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* 1-Click WhatsApp Login Button */}
            <button
              onClick={handleLoginWithWhatsApp}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22bf5b] hover:to-[#0f7a6d] text-white font-semibold text-[15px] shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/45 active-scale flex items-center justify-center gap-3 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyiapkan WhatsApp...</span>
                </>
              ) : (
                <>
                  <WhatsAppIcon size={22} />
                  <span>Masuk via WhatsApp</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* State 2: Waiting for WhatsApp Message (Clean & Simple) */
          <div className="ios-liquid-glass rounded-[32px] p-7 space-y-6 text-center relative shadow-2xl border border-white/40 dark:border-white/10 animate-in fade-in duration-300">
            {/* Top Bar with Timer & Back */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setSession(null);
                  setError(null);
                }}
                className="flex items-center gap-1 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Batal</span>
              </button>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg-secondary/80 border border-border-color text-[11px] font-semibold text-text-primary">
                <span className="material-symbols-outlined text-[13px] text-[#2170e4]">timer</span>
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Animated Pulsing Radar */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-[#25D366]/30 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30">
                <WhatsAppIcon size={32} />
              </div>
            </div>

            {/* Status Text */}
            <div className="space-y-1.5">
              <h3 className="text-[19px] font-bold text-text-primary">
                Menunggu Pesan WhatsApp
              </h3>
              <p className="text-[13px] text-text-secondary leading-relaxed max-w-[280px] mx-auto">
                Pesan verifikasi telah disiapkan di WhatsApp Anda. Cukup tekan <strong className="text-text-primary font-semibold">Kirim</strong> di chat WhatsApp.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <a
                href={session.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22bf5b] hover:to-[#0f7a6d] text-white font-semibold text-[14px] shadow-lg shadow-[#25D366]/25 active-scale flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <WhatsAppIcon size={18} />
                <span>Buka WhatsApp Lagi</span>
              </a>

              {/* Toggle QR Code for Desktop */}
              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full py-2.5 px-4 rounded-xl bg-bg-secondary/60 hover:bg-bg-secondary text-text-secondary hover:text-text-primary text-[12px] font-medium border border-border-color transition-all active-scale flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>{showQR ? 'Sembunyikan QR Code' : 'Scan QR Code via HP'}</span>
              </button>
            </div>

            {/* Collapsible QR Code */}
            {showQR && (
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-border-color space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <img
                  src={qrCodeUrl}
                  alt="WhatsApp QR Code"
                  className="w-36 h-36 mx-auto object-contain rounded-lg"
                />
                <p className="text-[11px] text-gray-600 font-medium">
                  Scan dengan kamera HP untuk membuka WhatsApp
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-2xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-[12px] flex items-center gap-2 text-left">
                <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto px-6 py-4 text-center text-[11px] text-text-secondary z-10">
        <p>© 2026 DompetKu</p>
      </footer>
    </div>
  );
};
