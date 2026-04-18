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

    // Listen for profile updates
    window.addEventListener('sakti_user_updated', loadUser);
    return () => window.removeEventListener('sakti_user_updated', loadUser);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
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

  // Close menu when clicking outside
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
    <header className="sticky top-0 z-[1100] bg-[#0a0f1a]/95 backdrop-blur-xl border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Title & Breadcrumb */}
        <div>
          <h2 className="font-orbitron font-bold text-base text-white tracking-wider">{title}</h2>
          <p className="text-xs text-cyan-500/60 mt-1 font-mono uppercase tracking-widest">{subtitle}</p>
        </div>

        {/* Right: Time, Alert, User */}
        <div className="flex items-center gap-5">
          {/* Live Clock */}
          <div className="font-mono text-cyan-400 text-sm tracking-wider">
            {formatTime(currentTime)} WIB
          </div>

          {/* Alert Button */}
          <button
            onClick={onAlertClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/15 border border-red-500/40 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors ews-animate-pulse-red"
          >
            <span><i className="fa-solid fa-bell"></i></span>
            <span>{alertCount}  </span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-3 cursor-pointer transition-all duration-300 p-1 rounded-xl ${isMenuOpen ? 'bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'hover:bg-white/5'}`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 border-2 border-cyan-500 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-cyan-400">{user?.name ? user.name.charAt(0) : 'U'}</span>
                )}
              </div>
              <div className="hidden sm:block mr-2 text-left">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  {user?.name || 'User SAKTI'}
                  <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}></i>
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{user?.role || 'PERSONEL'}</div>
              </div>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#0d1425] border border-gray-800 rounded-xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">

                <button 
                  onClick={navigateToProfile}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left group"
                >
                  <i className="fa-solid fa-user-gear text-gray-500 group-hover:text-cyan-400"></i>
                  <span>Profil Akun</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left group">
                  <i className="fa-solid fa-briefcase text-gray-500 group-hover:text-cyan-400"></i>
                  <span>Akses Sistem</span>
                </button>
                <div className="my-2 border-t border-gray-800"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all text-left group"
                >
                  <i className="fa-solid fa-right-from-bracket group-hover:translate-x-1 transition-transform"></i>
                  <span className="font-bold">Logout Sistem</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
