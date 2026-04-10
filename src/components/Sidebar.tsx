import type { PageType } from '../App';

interface SidebarProps {
  currentPage: PageType;
}

interface MenuItem {
  id: PageType;
  label: string;
  icon: string;
  badge?: { count: number; color: 'red' | 'yellow' };
}

interface MenuSection {
  title: string;
  subtitle?: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'UNIT OPERASIONAL',
    subtitle: 'POLRES KOTA METRO',
    items: []
  },
  {
    title: 'MODUL INTELIJEN',
    items: [
      { id: 'osint', label: 'Social Sensing & OSINT', icon: '🌐', badge: { count: 7, color: 'red' } },
      { id: 'prediktif', label: 'Analitik Prediktif', icon: '🔮' },
    ]
  },
  {
    title: 'MODUL OPERASIONAL',
    items: [
      { id: 'peta', label: 'Crime Mapping', icon: '🗺️', badge: { count: 3, color: 'red' } },
      { id: 'reskrim', label: 'Manajemen Investigasi', icon: '🔍' },
    ]
  },
  {
    title: 'KOLABORASI & SISTEM',
    items: [
      { id: 'kolaborasi', label: 'Kolaborasi Sektoral', icon: '🤝' },
      { id: 'integritas', label: 'Integritas & Keamanan', icon: '🛡️' },
    ]
  },
  {
    title: 'MITIGASI & PANTAUAN',
    items: [
      { id: 'bencana', label: 'Mitigasi Bencana', icon: '🌋', badge: { count: 2, color: 'yellow' } },
      { id: 'cuaca', label: 'Prediksi Cuaca', icon: '🌦️' },
      { id: 'sembako', label: 'Harga Sembako', icon: '🛒', badge: { count: 4, color: 'yellow' } },
      { id: 'mitigasi', label: 'Mitigasi Keamanan', icon: '🔐', badge: { count: 5, color: 'red' } },
    ]
  }
];

export default function Sidebar({ currentPage }: SidebarProps) {
  const navigateTo = (page: PageType) => {
    window.location.hash = `#/${page}`;
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#070a12] border-r border-gray-800/50 z-50 flex flex-col font-rajdhani overflow-hidden">
      {/* Logo Section */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <span className="font-orbitron font-black text-2xl text-white">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron font-black text-3xl text-cyan-400 tracking-tighter">SAKTI</span>
            <span className="text-[10px] text-gray-500 font-bold tracking-widest -mt-1 uppercase">Early Warning System</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 ews-scrollbar">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="mb-6">
            <div className="px-2 mb-2">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{section.title}</div>
              {section.subtitle && (
                <div className="text-sm font-black text-white tracking-widest mt-1 uppercase">{section.subtitle}</div>
              )}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative
                    ${currentPage === item.id 
                      ? 'bg-cyan-500/10 border border-cyan-500/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                      : 'hover:bg-gray-800/30'
                    }
                  `}
                >
                  {/* Active Indicator Bar */}
                  {currentPage === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee]" />
                  )}

                  <span className={`text-xl transition-all duration-300 ${currentPage === item.id ? 'grayscale-0' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                    {item.icon}
                  </span>
                  
                  <span className={`text-sm font-bold tracking-wide flex-1 text-left ${currentPage === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className={`
                      min-w-[18px] h-[18px] flex items-center justify-center rounded px-1 text-[10px] font-black text-gray-900
                      ${item.badge.color === 'red' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]'}
                    `}>
                      {item.badge.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Status Section */}
      <div className="p-5 border-t border-gray-800/50 bg-[#05080f]/80 backdrop-blur-md">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 ews-animate-blink shadow-[0_0_8px_#10b981]" />
              <span className="text-xs text-gray-400 font-bold">Platform Online</span>
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AKTIF</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 ews-animate-blink shadow-[0_0_8px_#fbbf24]" />
              <span className="text-xs text-gray-400 font-bold">Sinkronisasi</span>
            </div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Realtime</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-800/50">
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Personel Aktif</div>
          <div className="font-orbitron text-3xl font-black text-cyan-400 tracking-tighter flex items-baseline">
            47<span className="text-lg text-gray-600 mx-1">/</span>62
          </div>
        </div>
      </div>
    </aside>
  );
}
