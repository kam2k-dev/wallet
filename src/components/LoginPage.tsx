import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { User } from '../types';
import { api } from '../api/client';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!credentialResponse.credential) {
        throw new Error('Credential dari Google Login tidak ditemukan.');
      }

      const res = await api.loginWithGoogle(credentialResponse.credential);
      if (res.success && res.user && res.token) {
        onLoginSuccess(res.user, res.token);
      } else {
        setError(res.error || 'Gagal autentikasi dengan server.');
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Terjadi kesalahan saat verifikasi Google Login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Login Google dibatalkan atau terjadi kesalahan.');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 transition-colors duration-200 ${
      isDarkMode ? 'bg-bg-primary text-text-primary' : 'bg-[#f4f7fb] text-text-primary'
    }`}>
      <button
        onClick={onToggleDarkMode}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-bg-secondary border border-border-color shadow-sm hover:scale-105 transition-all text-text-secondary hover:text-text-primary"
        title="Toggle Theme"
      >
        <span className="material-symbols-outlined text-[20px]">
          {isDarkMode ? 'light_mode' : 'dark_mode'}
        </span>
      </button>

      <div className="w-full max-w-sm bg-bg-secondary border border-border-color rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2170e4] to-[#0051a8] flex items-center justify-center text-white mx-auto shadow-lg shadow-[#2170e4]/20">
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M27 8H7a1 1 0 0 1 0-2h17a1 1 0 1 0 0-2H7a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h20a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2m-4.5 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">DompetKu</h1>
          <p className="text-sm text-text-secondary mt-1">
            Masuk dengan akun Google Anda untuk melanjutkan
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-center py-2">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              <span>Memproses Login...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme={isDarkMode ? 'filled_black' : 'outline'}
              shape="pill"
              size="large"
              width="280"
              text="signin_with"
            />
          )}
        </div>

        <p className="text-[11px] text-text-secondary pt-2">
          Dengan melanjutkan, Anda menyetujui Ketentuan Layanan & Kebijakan Privasi kami.
        </p>
      </div>
    </div>
  );
};
