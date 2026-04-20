import { useState, useRef, useEffect } from 'react';
import { getApiBase, authFetch } from '../store/useAppStore';
// import { getConditionIcon } from '../utils/dashboardUtils';
import type { AlertItem } from '../types';

interface TopbarProps {
  title: string;
  subtitle: string;
  currentTime: Date;
  alerts: AlertItem[];
  latestUpdate?: string;
}

const API_BASE = getApiBase();
const SERVER_URL = API_BASE.replace('/api', '');

export default function Topbar({ title, subtitle, currentTime, alerts }: TopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useState('Jakarta, ID');
  const [weather, setWeather] = useState({ temp: 28, condition: 'Cerah' });
  const [timezoneLabel, setTimezoneLabel] = useState('WIB');
  const menuRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-500 border-red-500/50 text-red-500',
    high: 'bg-amber-500 border-amber-500/50 text-amber-500',
    medium: 'bg-blue-500 border-blue-500/50 text-blue-500',
    low: 'bg-gray-500 border-gray-500/50 text-gray-400'
  };

  const tagColors: Record<string, string> = {
    'KRITIS': 'bg-red-500/20 text-red-400 border-red-500/30',
    'LANTAS': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'WASPADA': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'INTELKAM': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'SEDANG': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'AI PREDIKTIF': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  };

  const loadUser = () => {
    const userData = sessionStorage.getItem('sakti_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  useEffect(() => {
    loadUser();
    
    // 1. Detect Timezone
    const detectTimezone = () => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Jakarta') || tz.includes('Pontianak')) setTimezoneLabel('WIB');
      else if (tz.includes('Makassar') || tz.includes('Jayapura')) setTimezoneLabel('WIT'); // Simplified
      else if (tz.includes('Singapore') || tz.includes('Kuala_Lumpur')) setTimezoneLabel('WITA');
      else setTimezoneLabel('TIMEZONE');
    };
    detectTimezone();

    // 2. Detect Location & Weather
    const detectLocation = () => {
      const fallbackToIP = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.city) {
            const cityName = data.city;
            setLocation(`${cityName}, ID`);
            fetchWeather(cityName);
          }
        } catch (err) {
          console.warn('IP-based location fallback failed', err);
        }
      };

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const token = import.meta.env.VITE_MAPBOX_TOKEN;
          
          if (token) {
            try {
              const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=place&limit=1`);
              const data = await res.json();
              if (data.features && data.features.length > 0) {
                const cityName = data.features[0].text;
                setLocation(`${cityName}, ID`);
                fetchWeather(cityName);
              }
            } catch (err) {
              console.error('Reverse geocoding failed', err);
              fallbackToIP();
            }
          } else {
            fallbackToIP();
          }
        }, (err) => {
          console.warn('Geolocation denied or failed, falling back to IP', err);
          fallbackToIP();
        }, { timeout: 5000 });
      } else {
        fallbackToIP();
      }
    };
    detectLocation();

    window.addEventListener('sakti_user_updated', loadUser);
    return () => window.removeEventListener('sakti_user_updated', loadUser);
  }, []);

  const fetchWeather = async (city: string) => {
    try {
      const res = await authFetch(`${API_BASE}/weather/forecast?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.forecast && data.forecast.length > 0) {
          const current = data.forecast[0];
          setWeather({
            temp: current.additional_data?.temp_max || current.temp_average || 28,
            condition: current.condition || 'Cerah'
          });
        }
      }
    } catch (err) {
      console.error('Weather sync failed', err);
    }
  };

  const getTimeIcon = (date: Date) => {
    const hour = date.getHours();
    // Pagi: Cerah Berawan (05-11)
    if (hour >= 5 && hour < 11) return { icon: 'fa-cloud-sun', color: 'text-amber-300' };
    // Siang: Terang (11-17)
    if (hour >= 11 && hour < 17) return { icon: 'fa-sun', color: 'text-amber-400' };
    // Sore: Menuju Senja (17-19)
    if (hour >= 17 && hour < 19) return { icon: 'fa-cloud-sun', color: 'text-orange-400' };
    // Malam: Bulan (19-05)
    return { icon: 'fa-moon', color: 'text-indigo-400' };
  };

  const timeIcon = getTimeIcon(currentTime);

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
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
        setIsAlertOpen(false);
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
          {/* Time of Day / Environment Widget */}
          <div className="hidden md:flex items-center gap-3 border-r border-white/10 pr-6">
            <i className={`fa-solid ${timeIcon.icon} ${timeIcon.color} text-sm`}></i>
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-orbitron font-bold text-white leading-none">{weather.temp}°C</span>
              <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">{location}</span>
            </div>
          </div>

          {/* Clock Widget */}
          <div className="flex flex-col items-end border-r border-white/10 pr-6 min-w-[100px]">
             <span className="font-mono text-[15px] font-black text-cyan-400 tracking-wider leading-none">
              {formatTime(currentTime)}
            </span>
            <span className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em] mt-1">{timezoneLabel}</span>
          </div>

          {/* Tactical Alert Button & Dropdown */}
          <div className="relative" ref={alertRef}>
            <button
              onClick={() => setIsAlertOpen(!isAlertOpen)}
              className={`relative group p-2 rounded-lg transition-all overflow-hidden border ${isAlertOpen ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'}`}
            >
              <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
              <div className="relative flex items-center gap-3">
                 <i className="fa-solid fa-bell text-red-500 text-sm animate-bounce duration-slow"></i>
                 <span className="font-orbitron font-black text-xs text-red-400">{alerts.length}</span>
              </div>
              {/* Glow sweep */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            {/* Tactical Alert Dropdown */}
            {isAlertOpen && (
              <div className="absolute right-0 mt-4 w-96 bg-[#0d1425]/95 backdrop-blur-2xl border border-red-500/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Tactical Header */}
                <div className="p-4 border-b border-red-500/20 bg-red-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 text-xs translate-y-[-1px]"></i>
                    <span className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em]">Alert Intelligence</span>
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono">{alerts.length} INSIDEN</span>
                </div>

                {/* Alert List */}
                <div className="max-h-[450px] overflow-y-auto ews-scrollbar divide-y divide-white/5">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-4 hover:bg-white/[0.03] transition-colors group cursor-pointer">
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded border flex items-center justify-center text-xs flex-shrink-0 bg-opacity-10 ${priorityColors[alert.priority]}`}>
                          <i className={alert.icon}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider truncate pr-2">{alert.title}</h4>
                            <span className="text-[8px] font-mono text-gray-500">{alert.time}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed mb-2">
                            {alert.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {alert.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className={`px-1.5 py-0.5 rounded-[2px] text-[7px] font-black uppercase tracking-widest border border-current ${tagColors[tag] || 'bg-cyan-500/10 text-cyan-400'}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {alerts.length === 0 && (
                    <div className="py-12 text-center opacity-30">
                       <i className="fa-solid fa-shield-check text-2xl mb-3 text-emerald-500"></i>
                       <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">System Clear // No Active Threats</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-black/40 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Status: Monitoring</span>
                  <button onClick={() => setIsAlertOpen(false)} className="text-[9px] text-red-500 font-black uppercase tracking-widest hover:text-red-400 transition-colors">Lihat Semua</button>
                </div>
              </div>
            )}
          </div>

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
