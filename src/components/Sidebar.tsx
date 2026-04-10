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
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-[#0a0f1a] to-[#070a12] border-r border-gray-800 z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <span className="font-orbitron font-black text-xl text-cyan-400">S</span>
          </div>
          <div>
            <div className="font-orbitron font-bold text-sm tracking-widest text-white">SAKTI</div>
            <div className="text-[10px] text-gray-500 tracking-tighter">NATIONAL SECURITY EWS</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 ews-scrollbar">
        <div className="px-3 mb-2">
          <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Modul Utama</span>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
              ${currentPage === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }
            `}
          >
            <span className={`text-lg grayscale group-hover:grayscale-0 transition-all ${currentPage === item.id ? 'grayscale-0' : ''}`}>
              {item.icon}
            </span>
            <span className="font-medium tracking-wide">{item.label}</span>
            {currentPage === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Status */}
      <div className="p-4 border-t border-gray-800 bg-black/20">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="ews-status-dot green ews-animate-blink" />
              <span className="text-xs text-gray-400">Platform Online</span>
            </div>
            <span className="text-xs font-bold text-emerald-400">AKTIF</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="ews-status-dot amber ews-animate-blink" />
              <span className="text-xs text-gray-400">Sinkronisasi</span>
            </div>
            <span className="text-xs font-bold text-amber-400">Realtime</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-800">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Personel Aktif</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-full bg-blue-900 border border-blue-400/30 flex items-center justify-center text-[10px] text-blue-200">
              AH
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-300 font-bold">AKBP Ahmad K.</span>
              <span className="text-[8px] text-gray-500">ID: 88090547</span>
            </div>
            <button className="ml-auto text-gray-600 hover:text-red-400 transition-colors">
              🚪
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
