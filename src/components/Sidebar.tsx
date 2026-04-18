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
    items: [
      { id: 'dashboard', label: 'Command Center', icon: 'fa-solid fa-house-chimney-medical' }
    ]
  },
  {
    title: 'INTELIJEN',
    items: [
      { id: 'osint', label: 'OSINT', icon: 'fa-solid fa-tower-broadcast', badge: { count: 7, color: 'red' } },
      { id: 'predictive-analytics', label: 'Analitik Prediktif', icon: 'fa-solid fa-wand-magic-sparkles' },
    ]
  },
  {
    title: 'OPERASIONAL',
    items: [
      { id: 'investigation-management', label: 'Manajemen Investigasi', icon: 'fa-solid fa-magnifying-glass-chart' },
    ]
  },
  {
    title: 'MITIGASI & PANTAUAN',
    items: [
      { id: 'weather-forecast', label: 'Prediksi Cuaca', icon: 'fa-solid fa-cloud-sun-rain' },
      { id: 'commodities-price', label: 'Harga Sembako', icon: 'fa-solid fa-cart-shopping', badge: { count: 4, color: 'yellow' } },
      { id: 'disaster-mitigation', label: 'Mitigasi Bencana', icon: 'fa-solid fa-volcano', badge: { count: 2, color: 'yellow' } },
      { id: 'security-mitigation', label: 'Mitigasi Keamanan', icon: 'fa-solid fa-user-shield', badge: { count: 5, color: 'red' } },
    ]
  }
];

export default function Sidebar({ currentPage }: SidebarProps) {
  const navigateTo = (page: PageType) => {
    window.location.hash = `#/${page}`;
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#070a12] border-r border-gray-800/50 z-[1200] flex flex-col font-rajdhani overflow-hidden">
      {/* Logo Section */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative group/logo">
            <div className="absolute inset-0 bg-cyan-400/30 rounded-xl blur-xl group-hover/logo:bg-cyan-400/60 transition-all duration-700 animate-pulse" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 border border-white/40 rounded-xl flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(34,211,238,0.3)]">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
              <i className="fa-solid fa-shield-halved absolute text-3xl text-white/20 group-hover/logo:scale-110 transition-transform duration-700"></i>
              <span className="relative font-orbitron font-black text-2xl text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] z-10 group-hover/logo:scale-110 transition-transform duration-500">S</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            </div>
            <div className="flex flex-col">
              <span className="font-orbitron font-black text-3xl text-white tracking-tighter drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]">SAKTI</span>
              <span className="text-[10px] text-cyan-400 font-bold tracking-widest -mt-1 uppercase opacity-80">Early Warning System</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 ews-scrollbar">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="mb-8">
            <div className="px-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-3 bg-cyan-500/40 rounded-full" />
                <div className="text-[9px] text-cyan-500/60 font-black uppercase tracking-[0.25em] leading-none">{section.title}</div>
              </div>
              {section.subtitle && (
                <div className="inline-flex flex-col border-l-2 border-white/10 pl-3 py-0.5 mt-1">
                  <div className="text-[14px] font-black text-white tracking-wider uppercase font-orbitron leading-tight">{section.subtitle}</div>
                  <div className="h-0.5 w-10 bg-cyan-500/30 mt-1 rounded-full" />
                </div>
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
                      : 'hover:bg-gray-800/30 border-b border-white/[0.03]'
                    }
                  `}
                >
                  {/* Active Indicator Bar */}
                  {currentPage === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee]" />
                  )}

                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${currentPage === item.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                    <i className={item.icon}></i>
                  </div>
                  
                  <span className={`text-sm font-bold tracking-wide flex-1 text-left ${currentPage === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className={`
                      min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1.5 text-[9px] font-bold
                      ${item.badge.color === 'red' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                        : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'}
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
        {JSON.parse(sessionStorage.getItem('sakti_user') || '{}')?.role === 'admin' && (
          <button
            onClick={() => navigateTo('security-integrity')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative mb-5
              ${currentPage === 'security-integrity' 
                ? 'bg-cyan-500/10 border border-cyan-500/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]' 
                : 'hover:bg-gray-800/30 border-b border-white/[0.03]'
              }
            `}
          >
            {currentPage === 'security-integrity' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#22d3ee]" />
            )}
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${currentPage === 'security-integrity' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <span className={`text-sm font-bold tracking-wide flex-1 text-left ${currentPage === 'security-integrity' ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
              Integritas & Keamanan
            </span>
          </button>
        )}

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
