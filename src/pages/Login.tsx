import { useState, useEffect } from 'react';
import { useTracking } from '../hooks/useTracking';
import { useAppStore } from '../store/useAppStore';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const addToast = useAppStore((s) => s.addToast);
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

    const success = await performSync((msg) => {
      setAuthStatus(msg);
    });

    if (success) {
      setAuthStatus('Otentikasi Berhasil. Membuka Dashboard...');
      sessionStorage.setItem('sakti_auth', 'true');
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    } else {
      setIsAuthenticating(false);
      setAuthStatus('');
      addToast('Gagal memverifikasi identitas. Periksa koneksi/izin.', 'alert');
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-[#05080f] flex items-center justify-center font-rajdhani overflow-hidden ${mounted ? 'animate-in fade-in duration-700' : 'opacity-0'}`}>
      {/* --- Immersive Background (Simplified) --- */}
      <div className="absolute inset-0 ews-grid-bg opacity-[0.07]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-transparent to-[#05080f] opacity-80" />
      
      {/* Subtle Vignette Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* --- Main Login Card --- */}
      <div className="relative w-full max-w-md mx-4 z-10">
        
        {/* SAKTI Emblem (Professional & Static) */}
        <div className="flex justify-center mb-10">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl rotate-12" />
            <div className="absolute inset-0 bg-[#070a12] border border-cyan-500/20 rounded-2xl -rotate-6 transition-transform hover:rotate-0 duration-500" />
            <span className="relative font-orbitron font-black text-4xl text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">S</span>
          </div>
        </div>

        <div className="bg-[#0a0f1a]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 pt-10 shadow-2xl relative overflow-hidden group">
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-orbitron font-bold text-2xl text-white tracking-[0.2em] uppercase mb-1">
              LOGIN <span className="text-cyan-500">SISTEM</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold">Terminal Otentikasi SAKTI v4.2</p>
          </div>

          <div className="relative">
            <form onSubmit={handleLogin} className={`space-y-6 transition-all duration-500 ${isAuthenticating ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
              {/* Input NRP */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black ml-1">ID Personel (NRP)</label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-cyan-500 transition-colors">
                    <i className="fa-solid fa-id-card-clip"></i>
                  </div>
                  <input 
                    type="text" 
                    value={nrp}
                    onChange={(e) => setNrp(e.target.value)}
                    placeholder="Contoh: 88041234"
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-700 outline-none focus:border-cyan-500/50 focus:bg-white/[0.02] transition-all"
                  />
                </div>
              </div>

              {/* Input PIN */}
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black ml-1">Pin Akses</label>
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-cyan-500 transition-colors">
                    <i className="fa-solid fa-lock text-sm"></i>
                  </div>
                  <input 
                    type="password" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-700 outline-none focus:border-cyan-500/50 focus:bg-white/[0.02] transition-all"
                  />
                </div>
              </div>

              {/* Submit Button (Clean & Modern) */}
              <button 
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-bold text-xs tracking-[0.3em] py-4 rounded-xl shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all active:scale-[0.98]"
              >
                LOGIN
              </button>
            </form>

            {/* --- Integrated Authenticating State --- */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${isAuthenticating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fa-solid fa-fingerprint text-3xl text-cyan-400"></i>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="font-orbitron text-xs text-white tracking-[0.2em] font-bold uppercase">Memverifikasi</div>
                <div className="font-mono text-[10px] text-cyan-500/60 uppercase tracking-widest">{authStatus}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Footer */}
        <div className="mt-8 flex justify-center items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Server Online</span>
          </div>
          <div className="w-px h-3 bg-gray-800" />
          <span className="text-[10px] text-gray-600 hover:text-gray-400 cursor-pointer transition-colors font-bold uppercase tracking-wider">Butuh Bantuan?</span>
        </div>
      </div>
    </div>
  );
}
