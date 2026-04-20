import type { PageType } from '../App';
import { useAppStore } from '../store/useAppStore';

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
      { id: 'command-center', label: 'Command Center', icon: 'fa-solid fa-house-chimney-medical' }
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
      { id: 'kamtibmas-management', label: 'Manajemen Kamtibmas', icon: 'fa-solid fa-magnifying-glass-chart' },
    ]
  },
  {
    title: 'MITIGASI & PANTAUAN',
    items: [
      { id: 'weather-forecast', label: 'Prediksi Cuaca', icon: 'fa-solid fa-cloud-sun-rain' },
      { id: 'commodities-price', label: 'Harga Sembako', icon: 'fa-solid fa-cart-shopping', badge: { count: 4, color: 'yellow' } },
      { id: 'disaster-history', label: 'Histori Bencana', icon: 'fa-solid fa-volcano', badge: { count: 2, color: 'yellow' } },
      { id: 'security-mitigation', label: 'Mitigasi Keamanan', icon: 'fa-solid fa-user-shield', badge: { count: 5, color: 'red' } },
      { id: 'traffic-accident-mitigation', label: 'Mitigasi Laka Lantas', icon: 'fa-solid fa-car-burst', badge: { count: 3, color: 'yellow' } },
    ]
  }
];

export default function Sidebar({ currentPage }: SidebarProps) {
  const { sidebarCounts, isSidebarCollapsed, toggleSidebar } = useAppStore();

  const navigateTo = (page: PageType) => {
    window.location.hash = `#/${page}`;
  };

  // Helper to get dynamic counts for items
  const getBadge = (id: PageType) => {
    switch (id) {
      case 'osint': 
        return { count: sidebarCounts.osint, color: 'red' as const };
      case 'commodities-price':
        return { count: sidebarCounts.commodities, color: 'yellow' as const };
      case 'disaster-history':
        return { count: sidebarCounts.disaster, color: 'yellow' as const };
      case 'security-mitigation':
        return { count: sidebarCounts.security, color: 'red' as const };
      case 'traffic-accident-mitigation':
        return { count: sidebarCounts.traffic, color: 'yellow' as const };
      default:
        return null;
    }
  };

  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${isSidebarCollapsed ? 'w-20' : 'w-72'} bg-[#0f172a] border-r border-slate-800/60 z-[1200] flex flex-col font-rajdhani overflow-hidden shadow-[10px_0_40px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out`}>
      {/* Tactical Toggle Button - Highly Prominent */}
      <button 
        onClick={toggleSidebar}
        className={`
          absolute -right-[12px] top-1/2 -translate-y-1/2 
          w-[24px] h-[64px] bg-[#0f172a] 
          border border-slate-700 shadow-[inset_0_0_10px_rgba(34,211,238,0.1),-5px_0_20px_rgba(0,0,0,0.5)] 
          rounded-r-xl flex items-center justify-center 
          z-50 transition-all duration-300 group/toggle overflow-hidden
          ${isSidebarCollapsed ? 'hover:w-[32px] hover:-right-[20px] bg-[#1e293b]' : 'hover:bg-[#1e293b]'}
        `}
      >
        {/* Glow Accent Strip */}
        <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${isSidebarCollapsed ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'} shadow-[0_0_10px_rgba(34,211,238,0.5)]`} />
        
        <div className={`
          flex items-center justify-center transition-all duration-300
          ${isSidebarCollapsed ? 'text-cyan-400 scale-125' : 'text-slate-500 group-hover/toggle:text-cyan-400'}
        `}>
          <i className={`fa-solid ${isSidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'} text-[12px] ${isSidebarCollapsed ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : ''}`}></i>
        </div>

        {/* Tactical Hover Highlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-cyan-500/10 opacity-0 group-hover/toggle:opacity-100 transition-opacity" />
      </button>

      {/* Logo Section */}
      <div className={`p-6 pb-4 ${isSidebarCollapsed ? 'px-4' : 'px-6'}`}>
        <div className="flex items-center gap-4">
          <div className="relative group/logo">
            <div className="absolute inset-0 bg-cyan-400/30 rounded-xl blur-xl group-hover/logo:bg-cyan-400/60 transition-all duration-700 animate-pulse" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 border border-white/40 rounded-xl flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(34,211,238,0.3)]">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
              <i className="fa-solid fa-shield-halved absolute text-3xl text-white/20 group-hover/logo:scale-110 transition-transform duration-700"></i>
              <span className="relative font-orbitron font-black text-2xl text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] z-10 group-hover/logo:scale-110 transition-transform duration-500">S</span>
               <div className="absolute inset-x-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000 ease-in-out" />
            </div>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="font-orbitron font-black text-3xl text-white tracking-tighter drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]">SAKTI</span>
                <span className="text-[10px] text-cyan-400 font-bold tracking-widest -mt-1 uppercase opacity-80">Early Warning System</span>
              </div>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 ews-scrollbar">
         {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="mb-8">
            {!isSidebarCollapsed && (
              <div className="px-3 mb-4 animate-in fade-in slide-in-from-left-1 duration-300">
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
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const badge = getBadge(item.id);
                return (
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
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.4)]" />
                    )}

                     <div className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ${isSidebarCollapsed ? 'flex-shrink-0 mx-auto' : ''} ${currentPage === item.id ? 'bg-indigo-500/20 text-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                      <i className={item.icon}></i>
                    </div>
                    
                    {!isSidebarCollapsed && (
                      <span className="text-sm font-bold tracking-wide flex-1 text-left text-white animate-in fade-in slide-in-from-left-1 duration-300">
                        {item.label}
                      </span>
                    )}

                    {badge && badge.count > 0 && (
                      <span className={`
                        ${isSidebarCollapsed ? 'absolute top-1 right-1' : 'min-w-[18px]'} h-[18px] flex items-center justify-center rounded-full px-1.5 text-[9px] font-bold
                        ${badge.color === 'red' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                          : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'}
                      `}>
                        {badge.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

       {/* Bottom Tactical HUD */}
      {!isSidebarCollapsed && (
        <div className="mt-auto p-4 border-t border-white/[0.03] bg-gradient-to-b from-transparent to-white/[0.02] animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Platform</span>
              </div>
              <div className="text-[10px] font-black text-emerald-400 px-2.5">AKTIF</div>
            </div>

            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Sync</span>
              </div>
              <div className="text-[10px] font-black text-amber-400 px-2.5 uppercase">Realtime</div>
            </div>
          </div>

          <div className="relative p-3 rounded-xl bg-cyan-500/[0.03] border border-cyan-500/10 overflow-hidden group/personnel">
            <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-500/30 w-full transform scale-x-0 group-hover/personnel:scale-x-100 transition-transform duration-700 origin-left" />
            
            <div className="text-[9px] text-gray-500 font-black uppercase tracking-[0.25em] mb-1">Personel Aktif</div>
            <div className="flex items-baseline gap-1">
              <span className="font-orbitron text-3xl font-black text-white leading-none tracking-tighter">47</span>
              <span className="text-sm font-bold text-cyan-500/50">/ 62</span>
            </div>

            <div className="flex gap-0.5 mt-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-0.5 flex-1 rounded-full ${i < 9 ? 'bg-cyan-500/40' : 'bg-gray-800'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
