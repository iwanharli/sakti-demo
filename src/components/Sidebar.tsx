import type { PageType } from '../App';

interface SidebarProps {
  currentPage: PageType;
}

const menuItems: { id: PageType; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard Utama', icon: '📊' },
  { id: 'osint', label: 'OSINT & Social Sensing', icon: '📡' },
  { id: 'prediktif', label: 'Analitik Prediktif', icon: '🎯' },
  { id: 'peta', label: 'Peta Kriminalitas', icon: '🗺️' },
  { id: 'reskrim', label: 'Manajemen Investigasi', icon: '⚖️' },
  { id: 'kolaborasi', label: 'Kolaborasi Sektoral', icon: '🤝' },
  { id: 'integritas', label: 'Integritas & Keamanan', icon: '🛡️' },
  { id: 'bencana', label: 'Mitigasi Bencana', icon: '🌋' },
  { id: 'cuaca', label: 'Prediksi Cuaca', icon: '🌦️' },
  { id: 'sembako', label: 'Harga Sembako', icon: '🛒' },
  { id: 'mitigasi', label: 'Keamanan Wilayah', icon: '🚨' },
];

export default function Sidebar({ currentPage }: SidebarProps) {
  const navigateTo = (page: PageType) => {
    window.location.hash = `#/${page}`;
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-[#0a0f1a] to-[#070a12] border-r border-gray-800 z-50 flex flex-col ews-animate-fade-in">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800/50 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center ews-glow-cyan">
            <span className="font-orbitron font-black text-xl text-cyan-400">S</span>
          </div>
          <div>
            <div className="font-orbitron font-bold text-sm tracking-widest text-white">SAKTI</div>
            <div className="text-[10px] text-gray-500 tracking-tighter uppercase font-bold">National Security</div>
          </div>
        </div>
      </div>

      {/* Navigation - Using Native EWS Styles */}
      <nav className="flex-1 overflow-y-auto pt-6 pb-4 px-3 space-y-1 ews-scrollbar">
        <div className="px-4 mb-4">
          <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-4 h-px bg-gray-800"></span>
            Modul Operasional
          </span>
        </div>
        
        {menuItems.map((item, idx) => (
          <div 
            key={item.id} 
            className="ews-animate-slide-in"
            style={{ animationDelay: `${idx * 0.03}s` }}
          >
            <div
              onClick={() => navigateTo(item.id)}
              className={`ews-nav-item relative ${currentPage === item.id ? 'active' : ''}`}
            >
              <span className={`text-lg transition-transform duration-300 ${currentPage === item.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'grayscale group-hover:grayscale-0'}`}>
                {item.icon}
              </span>
              <span className={`font-semibold tracking-wide ${currentPage === item.id ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {item.label}
              </span>
              
              {/* Active Indicator Bar (Handled by .active::before in index.css but reinforced here for premium feel) */}
              {currentPage === item.id && (
                <div className="absolute right-2 w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Status Section */}
      <div className="mt-auto p-4 bg-black/40 border-t border-gray-800 backdrop-blur-md">
        <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-800/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="ews-status-dot green ews-animate-blink" />
              <span className="text-[11px] text-gray-400 font-medium">Platform Core</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 rounded">ONLINE</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="ews-status-dot cyan ews-animate-blink" />
              <span className="text-[11px] text-gray-400 font-medium">Sync Data</span>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 rounded">REALTIME</span>
          </div>
        </div>

        {/* User Profile Info */}
        <div className="mt-4 px-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 group hover:border-cyan-500/30 transition-all cursor-pointer">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 p-[1px]">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                  AH
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#070a12] rounded-full flex items-center justify-center border border-gray-800">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-[11px] text-gray-200 font-bold truncate">AKBP Ahmad K.</span>
              <span className="text-[9px] text-gray-500 font-mono tracking-tighter">NRP: 88090547</span>
            </div>
            <button className="text-gray-600 hover:text-red-400 transition-colors p-1" title="Logout">
              🚪
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
