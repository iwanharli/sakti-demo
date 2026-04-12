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

    // Call the tracking logic (biometric/geo step)
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
    <div className={`fixed inset-0 z-[100] bg-[#070a12] flex items-center justify-center font-rajdhani overflow-hidden ${mounted ? 'ews-animate-fade-in' : 'opacity-0'}`}>
      {/* --- Immersive Background --- */}
      <div className="absolute inset-0 ews-grid-bg opacity-20" />
      
      {/* Animated Light Nodes */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Floating Decorative HUD Elements */}
      <div className="absolute top-10 left-10 opacity-30 pointer-events-none hidden lg:block">
        <div className="text-[10px] text-cyan-500 font-mono space-y-1">
          <div>SYS_LOAD: 24.2%</div>
          <div>NET_STABLE: OK</div>
          <div>ENCR_AES256: ACTIVE</div>
        </div>
      </div>
      <div className="absolute bottom-10 right-10 opacity-30 pointer-events-none hidden lg:block">
        <div className="text-[10px] text-cyan-500 font-mono text-right space-y-1">
          <div>LOC_JKT_SVR: ONLINE</div>
          <div>TZ: UTC+7</div>
          <div>{new Date().toISOString()}</div>
        </div>
      </div>

      <div className="absolute inset-0 ews-scanline pointer-events-none" />

      {/* --- Main Login Card --- */}
      <div className={`relative w-full max-w-md mx-4 transition-all duration-700 transform ${isAuthenticating ? 'scale-[1.02]' : 'scale-100'}`}>
        
        {/* SAKTI Emblem Container */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-20">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Hexagon Shield */}
            <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-md border border-cyan-500/50 rotate-45 animate-[spin_10s_linear_infinite]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            <div className="absolute inset-2 bg-[#070a12] border border-cyan-500/30" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
            <span className="relative font-orbitron font-black text-4xl text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">S</span>
          </div>
        </div>

        <div className="ews-glass-premium p-8 pt-16 relative overflow-hidden ews-cyber-flicker">
          {/* HUD Brackets */}
          <div className="ews-hud-bracket ews-hud-bracket-tl" />
          <div className="ews-hud-bracket ews-hud-bracket-tr" />
          <div className="ews-hud-bracket ews-hud-bracket-bl" />
          <div className="ews-hud-bracket ews-hud-bracket-br" />

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-orbitron font-bold text-3xl text-white tracking-[0.2em] uppercase mb-2">
              SAKTI <span className="text-cyan-500">EWS</span>
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-700" />
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.6em]">Terminal Akses Nasional</p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-700" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {/* Input NRP */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-semibold">ID Personel (NRP)</label>
                <span className="text-[10px] text-cyan-500/50 font-mono opacity-0 group-focus-within:opacity-100 transition-opacity">REQUIRED</span>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input 
                  type="text" 
                  value={nrp}
                  onChange={(e) => setNrp(e.target.value)}
                  placeholder="MASUKKAN NRP"
                  disabled={isAuthenticating}
                  className="ews-input-tactical w-full py-4 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-800 uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Input PIN */}
            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-semibold">Sandi Keamanan (PIN)</label>
                <span className="text-[10px] text-cyan-500/50 font-mono opacity-0 group-focus-within:opacity-100 transition-opacity">SECURE</span>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input 
                  type="password" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••"
                  disabled={isAuthenticating}
                  className="ews-input-tactical w-full py-4 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-800 tracking-widest"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isAuthenticating}
              className={`
                w-full relative group/btn h-14 overflow-hidden transition-all duration-500
                ${isAuthenticating 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 cursor-wait' 
                  : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400'
                }
              `}
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              
              <span className="relative z-10 font-orbitron font-bold text-xs tracking-[0.4em] flex items-center justify-center gap-3">
                {isAuthenticating ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    AUTENTIKASI...
                  </>
                ) : (
                  <>MASUK SISTEM <span className="text-lg opacity-50">→</span></>
                )}
              </span>
            </button>
          </form>

          {/* --- Biometric Scan Overlay --- */}
          <div className={`absolute inset-0 z-20 bg-[#070a12]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 transition-all duration-500 ${isAuthenticating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
            <div className="relative w-48 h-48 mb-8">
              {/* Scan Ray */}
              <div className="absolute inset-0 flex flex-col">
                <div className="w-full h-1 bg-cyan-500/50 shadow-[0_0_15px_#06b6d4] ews-scan-ray z-30" />
              </div>
              
              {/* Scan Target Area */}
              <div className="absolute inset-0 border border-cyan-500/20 rounded-full flex items-center justify-center">
                <div className="w-[90%] h-[90%] border border-cyan-500/10 rounded-full animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Fingerprint or Face Icon */}
                  <div className="text-cyan-500/40 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17.15V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1.85m20-4V12a10 10 0 0 0-20 0v1.15"/><path d="M6 12a6 6 0 0 1 12 0"/><path d="M10 12a2 2 0 0 1 4 0"/><path d="m11 17 1 1 2-2"/></svg>
                  </div>
                </div>
              </div>

              {/* Decorative Compass Lines */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <div key={deg} className="absolute inset-0 border-t border-cyan-500/20 w-full h-px top-1/2 -translate-y-1/2" style={{ transform: `rotate(${deg}deg) scale(1.1)` }} />
              ))}
            </div>

            <div className="text-center space-y-4 w-full">
              <div className="font-orbitron text-xs text-amber-500 tracking-[0.3em] font-bold">VERIFIKASI PERSONEL</div>
              <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest h-4 overflow-hidden">
                {authStatus}
              </div>
              <div className="w-full h-1 bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500/50 transition-all duration-300" style={{ width: authStatus.includes('Gagal') ? '0%' : '65%' }} />
              </div>
              <div className="flex justify-between px-2">
                 <span className="text-[8px] text-gray-600 font-mono">ENCRYPT_KEY: XA-442</span>
                 <span className="text-[8px] text-gray-600 font-mono">UID: {nrp || 'UNKNOWN'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Secured by Sakti Sentinel v4.2</span>
          </div>
          <div className="flex gap-4">
            <span className="text-[9px] text-gray-700 font-mono hover:text-cyan-500/50 cursor-help transition-colors">HELP</span>
            <span className="text-[9px] text-gray-700 font-mono hover:text-cyan-500/50 cursor-help transition-colors">EN</span>
          </div>
        </div>
      </div>
    </div>
  );
}
