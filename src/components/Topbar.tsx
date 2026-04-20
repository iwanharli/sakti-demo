import { useState, useRef, useEffect } from 'react';
import { getApiBase } from '../store/useAppStore';

interface TopbarProps {
  title: string;
  subtitle: string;
  currentTime: Date;
  alertCount: number;
  onAlertClick: () => void;
}

const API_BASE = getApiBase();
const SERVER_URL = API_BASE.replace('/api', '');

export default function Topbar({ title, subtitle, currentTime, alertCount, onAlertClick }: TopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadUser = () => {
    const userData = sessionStorage.getItem('sakti_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('sakti_user_updated', loadUser);
    return () => window.removeEventListener('sakti_user_updated', loadUser);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sakti_auth');
    sessionStorage.removeItem('sakti_token');
    sessionStorage.removeItem('sakti_user');
    window.location.hash = '#/login';
  };

  const navigateToProfile = () => {
    window.location.hash = '#/account-profile';
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = user?.picture ? `${SERVER_URL}${user.picture}` : null;

  return (
    <header className="sticky top-0 z-[1100] bg-[#0a0f1a]/80 backdrop-blur-2xl border-b border-white/[0.05] px-6 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Precision Glow Border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent shadow-[0_0_10px_#06b6d4]" />
      
      <div className="flex items-center justify-between relative z-10">
        {/* Left: Tactical Breadcrumbs */}
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-gradient-to-b from-cyan-500/40 to-indigo-500/40 rounded-full" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-cyan-500/60 font-black tracking-[0.3em] uppercase">SAKTI</span>
              <span className="text-gray-700 text-xs">/</span>
              <h2 className="font-orbitron font-black text-[14px] text-white tracking-[0.2em] uppercase">{title}</h2>
            </div>
            <p className="text-[9px] text-gray-500 mt-0.5 font-bold uppercase tracking-[0.15em] opacity-80">{subtitle}</p>
          </div>
        </div>


        {/* Right: Widgets & Profile */}
        <div className="flex items-center gap-6">
          {/* Weather Widget */}
          <div className="hidden md:flex items-center gap-3 border-r border-white/10 pr-6">
            <i className="fa-solid fa-cloud-sun text-amber-400 text-sm"></i>
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-orbitron font-bold text-white leading-none">28°C</span>
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">Jakarta, ID</span>
            </div>
          </div>

          {/* Clock Widget */}
          <div className="flex flex-col items-end border-r border-white/10 pr-6 min-w-[100px]">
             <span className="font-mono text-[15px] font-black text-cyan-400 tracking-wider leading-none">
              {formatTime(currentTime)}
            </span>
            <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mt-1">WIB // TIMEZONE</span>
          </div>

          {/* Tactical Alert Button */}
          <button
            onClick={onAlertClick}
            className="relative group p-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
            <div className="relative flex items-center gap-3">
               <i className="fa-solid fa-bell text-red-500 text-sm animate-bounce duration-slow"></i>
               <span className="font-orbitron font-black text-xs text-red-400">{alertCount}</span>
            </div>
            {/* Glow sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          {/* User Profile */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-3 p-1 rounded-xl transition-all duration-300 ${isMenuOpen ? 'bg-white/5 ring-1 ring-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'hover:bg-white/5'}`}
            >
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 flex items-center justify-center overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-cyan-500/10" />
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="relative z-10 text-xs font-black font-orbitron text-cyan-400">{user?.name ? user.name.charAt(0) : 'U'}</span>
                )}
                {/* Active corners */}
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-500" />
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-500" />
              </div>
              <div className="hidden sm:block text-left mr-1">
                <div className="text-[12px] font-black text-white flex items-center gap-2 uppercase tracking-wide">
                  {user?.name || 'User SAKTI'}
                  <i className={`fa-solid fa-chevron-down text-[8px] text-gray-500 transition-transform duration-500 ${isMenuOpen ? 'rotate-180 text-cyan-500' : ''}`}></i>
                </div>
                <div className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-0.5">{user?.role || 'PERSONEL'} // OPS</div>
              </div>
            </button>

            {/* Cyber-Card Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-4 w-60 bg-[#0d1425]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Tactical Highlight */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="text-[10px] text-cyan-500/60 font-black uppercase tracking-widest mb-1">Authenticated Personnel</div>
                  <div className="text-sm font-black text-white truncate">{user?.name}</div>
                  <div className="text-[9px] text-gray-500 uppercase tracking-wider mt-1">{user?.role === 'admin' ? 'SYSTEM_ADMIN_ROOT' : 'STANDARD_OPERATOR'}</div>
                </div>

                <div className="py-2">
                  <button onClick={navigateToProfile} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-400 hover:bg-cyan-500/10 hover:text-white transition-all text-left group">
                    <i className="fa-solid fa-user-gear text-cyan-500/40 group-hover:text-cyan-400 transition-colors"></i>
                    <span className="font-bold tracking-wide uppercase">Profil Akses & Keamanan</span>
                  </button>
                  {user?.role === 'admin' && (
                    <button onClick={() => { window.location.hash = '#/security-integrity'; setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-400 hover:bg-cyan-500/10 hover:text-white transition-all text-left group">
                      <i className="fa-solid fa-shield-halved text-cyan-500/40 group-hover:text-cyan-400 transition-colors"></i>
                      <span className="font-bold tracking-wide uppercase">Integritas Sistem Root</span>
                    </button>
                  )}
                </div>

                <div className="p-2 border-t border-white/5 bg-black/40">
                  <button onClick={handleLogout} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 transition-all group">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Logout Sistem</span>
                    <i className="fa-solid fa-right-from-bracket text-red-500 text-xs group-hover:translate-x-1 transition-transform"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
