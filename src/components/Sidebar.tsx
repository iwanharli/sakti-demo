import type { PageType } from '../App';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

interface NavItem {
  id: PageType;
  icon: string;
  label: string;
  section?: string;
  badge?: number;
  badgeColor?: 'red' | 'amber';
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: '📊', label: 'Command Center' },
  { id: 'osint', icon: '🌐', label: 'Social Sensing & OSINT', section: 'Modul Intelijen', badge: 7, badgeColor: 'red' },
  { id: 'prediktif', icon: '🔮', label: 'Analitik Prediktif' },
  { id: 'peta', icon: '🗺️', label: 'Crime Mapping', section: 'Modul Operasional', badge: 3, badgeColor: 'red' },
  { id: 'reskrim', icon: '🔍', label: 'Manajemen Investigasi' },
  { id: 'kolaborasi', icon: '🤝', label: 'Kolaborasi Sektoral', section: 'Kolaborasi & Sistem' },
  { id: 'integritas', icon: '🛡️', label: 'Integritas & Keamanan' },
  { id: 'bencana', icon: '🌋', label: 'Mitigasi Bencana', section: 'Mitigasi & Pantauan', badge: 2, badgeColor: 'amber' },
  { id: 'cuaca', icon: '🌦️', label: 'Prediksi Cuaca' },
  { id: 'sembako', icon: '🛒', label: 'Harga Sembako', badge: 4, badgeColor: 'amber' },
  { id: 'mitigasi', icon: '🔐', label: 'Mitigasi Keamanan', badge: 5, badgeColor: 'red' },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-[#0a0f1a] to-[#070a12] border-r border-gray-800 z-50 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 border-2 border-cyan-500 flex items-center justify-center ews-animate-pulse-cyan">
            <span className="font-orbitron font-black text-lg text-cyan-400">S</span>
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-lg text-cyan-400 tracking-wider">SAKTI</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Early Warning System</p>
          </div>
        </div>
      </div>

      {/* Unit Info */}
      <div className="px-4 py-3 bg-cyan-500/5 border-b border-gray-800">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Unit Operasional</span>
        <span className="text-sm font-semibold text-gray-300 tracking-wide">POLRES KOTA METRO</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item, index) => {
          const isActive = currentPage === item.id;
          const showSection = item.section && (index === 0 || navItems[index - 1].section !== item.section);
          
          return (
            <div key={item.id}>
              {showSection && (
                <div className="px-3 pt-4 pb-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  {item.section}
                </div>
              )}
              <div
                onClick={() => onPageChange(item.id)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 mb-0.5
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 text-cyan-400 border border-cyan-500/30' 
                    : 'text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-500 rounded-r ews-glow-cyan" />
                )}
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`
                    px-1.5 py-0.5 rounded text-[10px] font-bold
                    ${item.badgeColor === 'red' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-gray-800">
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
          <div className="mt-1 font-orbitron text-lg">
            <span className="text-cyan-400">47</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-500">62</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
