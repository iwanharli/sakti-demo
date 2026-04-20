import { useDisasterData } from '../hooks/useDisasterData';
import CountUp from '../components/CountUp';

export default function DisasterHistory() {
  const { 
    history, 
    stats, 
    loading, 
    selectedRegion, 
    setSelectedRegion,
    selectedCategory,
    setSelectedCategory,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    refresh,
    resetFilters,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    totalPages,
    availableRegions,
    availableCategories
  } = useDisasterData();

  const getEventIcon = (cat: string) => {
    switch (cat) {
      case 'BANJIR': return 'fa-solid fa-house-flood-water';
      case 'CUACA EKSTREM': return 'fa-solid fa-cloud-bolt';
      case 'TANAH LONGSOR': return 'fa-solid fa-hill-rockslide';
      case 'KEBAKARAN HUTAN DAN LAHAN': return 'fa-solid fa-fire-extinguisher';
      case 'GEMPABUMI': return 'fa-solid fa-house-crack';
      default: return 'fa-solid fa-triangle-exclamation';
    }
  };

  const getEventColor = (cat: string) => {
    switch (cat) {
      case 'BANJIR': return 'text-cyan-400';
      case 'CUACA EKSTREM': return 'text-amber-400';
      case 'TANAH LONGSOR': return 'text-orange-400';
      case 'KEBAKARAN HUTAN DAN LAHAN': return 'text-red-500';
      case 'GEMPABUMI': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const formatLocation = (loc: string, category: string): string[] => {
    if (!loc) return [];
    let clean = loc
      .replace(/Kecamatan:[\/|\\]n/gi, '')
      .replace(/[\/|\\]n/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (clean.toUpperCase() === category.toUpperCase()) return [];

    const parts = clean.split(/(?=Kec\.)|(?=Kecamatan )/gi);
    return parts
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => p.toUpperCase());
  };

  const paginatedHistory = history.slice((page - 1) * pageSize, page * pageSize);

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all duration-300 flex items-center justify-center border ${
            page === i 
              ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
              : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="space-y-6 ews-animate-fade-in">
      {/* HERO STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="ews-stat-card red group cursor-default">
          <div className="text-[11px] text-gray-500 uppercase font-orbitron tracking-widest mb-3">Total Meninggal</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">
            <CountUp value={Number(stats?.deaths || 0)} />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-rajdhani font-bold text-red-500/80 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Casualty Log
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 text-red-500 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-skull-crossbones"></i>
          </div>
        </div>

        <div className="ews-stat-card amber group cursor-default">
          <div className="text-[11px] text-gray-500 uppercase font-orbitron tracking-widest mb-3">Korban Luka</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">
            <CountUp value={Number(stats?.injured || 0)} />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-rajdhani font-bold text-amber-500/80 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Medical Response
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 text-amber-500 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-user-injured"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan group cursor-default">
          <div className="text-[11px] text-gray-500 uppercase font-orbitron tracking-widest mb-3">Rumah Terdampak</div>
          <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">
            <CountUp value={Number(stats?.damage || 0)} />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-rajdhani font-bold text-cyan-500/80 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Infrastructure
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 text-cyan-400 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-house-crack"></i>
          </div>
        </div>

        <div className="ews-stat-card emerald group cursor-default">
          <div className="text-[11px] text-gray-500 uppercase font-orbitron tracking-widest mb-3">Total Kejadian</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">
            <CountUp value={Number(stats?.total_events || 0)} />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-rajdhani font-bold text-emerald-500/80 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Event Record
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-10 text-emerald-400 group-hover:opacity-20 transition-opacity">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
        </div>
      </div>

      {/* MAIN DATA GRID - Unified Tactical Design */}
      <div className="flex flex-col bg-[#0d121f]/40 backdrop-blur-md rounded-2xl border border-white/5">
        {/* Command Header */}
        <div className="p-4 border-b border-white/5 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" />
              <h2 className="text-xl font-bold text-white tracking-widest uppercase truncate leading-none font-orbitron">Bencana Log</h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Kategori Filter */}
              <div className="flex items-center gap-3 bg-black/80 px-4 py-3 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner hover:border-white/10">
                <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3">Kategori</span>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer uppercase hover:text-cyan-400 transition-colors"
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat} className="bg-[#0d121f]">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Utility Buttons */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={refresh}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all active:scale-95"
                  title="Refresh Dashboard"
                >
                  <i className="fa-solid fa-rotate text-sm" />
                </button>
                <button 
                  onClick={resetFilters}
                  className="px-4 h-10 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 transition-all active:scale-95"
                  title="Reset All Filters"
                >
                  <i className="fa-solid fa-filter-circle-xmark text-sm" />
                  <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Tactical Search */}
            <div className="flex-1 relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors text-base" />
              <input 
                type="text"
                placeholder="Search city, location, or cause..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/80 border-2 border-white/5 rounded-2xl py-3.5 pl-12 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-circle-xmark text-lg" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Wilayah Filter */}
              <div className="flex items-center gap-3 bg-black/80 px-4 py-3 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner">
                <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3 whitespace-nowrap">Wilayah</span>
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer uppercase min-w-[140px]"
                >
                  {availableRegions.map(p => (
                    <option key={p} value={p} className="bg-[#0d121f]">{p}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center gap-3 bg-black/80 px-4 py-3 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner">
                <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3 whitespace-nowrap">Rentang</span>
                <div className="flex items-center gap-3">
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer uppercase"
                  />
                  <span className="text-gray-600 text-[10px]">—</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Tactical Data...</span>
              </div>
            </div>
          )}

           <div className="flex flex-col divide-y divide-white/[0.03]">
              {paginatedHistory.map((event) => (
                <div 
                  key={event.id}
                  className="group relative flex items-center gap-6 p-6 hover:bg-white/[0.02] transition-all duration-300"
                >
                  {/* GLOW DECORATOR */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity ${getEventColor(event.category).replace('text-', 'bg-')}`} />

                  {/* COL 1: IDENTITY & TEMPORAL */}
                  <div className="flex flex-col items-center w-28 shrink-0">
                    <div className={`w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-2xl mb-2 group-hover:border-cyan-500/30 transition-all shadow-inner ${getEventColor(event.category)}`}>
                      <i className={getEventIcon(event.category)}></i>
                    </div>
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest font-mono">
                      {new Date(event.report_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* COL 2: GEOSPATIAL & NARRATIVE */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${getEventColor(event.category)} ${getEventColor(event.category).replace('text-', 'border-').replace('-400', '-500/20').replace('-500', '-600/20')} bg-white/[0.02]`}>
                        {event.category}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold tracking-wider uppercase">
                        <i className="fa-solid fa-location-dot text-[9px] text-cyan-500/50"></i>
                        <span className="truncate">{event.city_name}</span>
                        <span className="text-white/10">•</span>
                        <span className="text-gray-500">{event.province_name}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                       {(() => {
                         const locs = formatLocation(event.location, event.category);
                         if (locs.length === 0) {
                           return <h3 className="text-[14px] font-black text-white/90 group-hover:text-cyan-400 transition-colors uppercase tracking-wide">LOKASI TIDAK TERPERINCI</h3>;
                         }
                         if (locs.length === 1) {
                           return <h3 className="text-[14px] font-black text-white/90 group-hover:text-cyan-400 transition-colors uppercase tracking-wide">{locs[0]}</h3>;
                         }
                         return (
                           <div className="space-y-1.5 mt-1">
                             {locs.map((l, idx) => (
                               <div key={idx} className="flex items-start gap-3 group/loc">
                                 <span className="text-[10px] text-cyan-500/40 font-mono mt-0.5">{idx + 1}.</span>
                                 <h3 className="text-[13px] font-black text-white/80 group-hover/loc:text-cyan-400 transition-colors uppercase tracking-wide leading-tight">
                                   {l}
                                 </h3>
                               </div>
                             ))}
                           </div>
                         );
                       })()}
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <i className="fa-solid fa-quote-left text-[8px] text-gray-700 mt-1"></i>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed italic tracking-wide">
                        {event.cause || 'PENYEBAB DALAM PROSES INVESTIGASI LAPORAN...'}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                       <span className="text-[9px] text-gray-600 font-mono tracking-tighter">REF-ID: {event.id.substring(0,8).toUpperCase()}</span>
                    </div>
                  </div>

                   {/* COL 3: IMPACT MATRIX (MINIMALIST HUD) */}
                   <div className="flex flex-col gap-3 min-w-[360px] px-6 py-2 border-l border-white/5">
                     {/* Row 1: Human Impact */}
                     <div className="grid grid-cols-3 gap-4">
                       <div className={`flex items-center gap-2 w-full cursor-help transition-opacity ${event.total_meninggal > 0 ? 'opacity-100' : 'opacity-30'}`} title="Meninggal Dunia (Jiwa)">
                         <i className="fa-solid fa-skull text-[10px] text-red-500 w-4 text-center"></i>
                         <span className={`text-2xl font-orbitron font-black min-w-[30px] text-center ${event.total_meninggal > 0 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-gray-400'}`}>
                           {event.total_meninggal || 0}
                         </span>
                         <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest w-8">MD</span>
                       </div>
 
                       <div className={`flex items-center gap-2 w-full cursor-help transition-opacity ${event.total_hilang > 0 ? 'opacity-100' : 'opacity-30'}`} title="Orang Hilang / Dalam Pencarian">
                         <i className="fa-solid fa-person-circle-question text-[10px] text-amber-500 w-4 text-center"></i>
                         <span className={`text-2xl font-orbitron font-black min-w-[30px] text-center ${event.total_hilang > 0 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'text-gray-400'}`}>
                           {event.total_hilang || 0}
                         </span>
                         <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest w-8">HLG</span>
                       </div>
 
                       <div className={`flex items-center gap-2 w-full cursor-help transition-opacity ${event.total_terluka > 0 ? 'opacity-100' : 'opacity-30'}`} title="Korban Terluka / Cedera">
                         <i className="fa-solid fa-user-injured text-[10px] text-blue-400 w-4 text-center"></i>
                         <span className={`text-2xl font-orbitron font-black min-w-[30px] text-center ${event.total_terluka > 0 ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]' : 'text-gray-400'}`}>
                           {event.total_terluka || 0}
                         </span>
                         <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest w-8">LKA</span>
                       </div>
                     </div>
 
                     {/* Divider line (Subtle) */}
                     <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent w-full" />
 
                     {/* Row 2: Infrastructure Impact */}
                     <div className="grid grid-cols-3 gap-4">
                       <div className={`flex items-center gap-2 w-full cursor-help transition-opacity ${event.total_rumah_rusak > 0 ? 'opacity-100' : 'opacity-30'}`} title="Jumlah Rumah Rusak / Hancur">
                         <i className="fa-solid fa-house-crack text-[10px] text-orange-400 w-4 text-center"></i>
                         <span className={`text-2xl font-orbitron font-black min-w-[30px] text-center ${event.total_rumah_rusak > 0 ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.3)]' : 'text-gray-400'}`}>
                           {event.total_rumah_rusak || 0}
                         </span>
                         <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest w-8">RSK</span>
                       </div>
 
                       <div className={`flex items-center gap-2 w-full cursor-help transition-opacity ${event.total_rumah_terendam > 0 ? 'opacity-100' : 'opacity-30'}`} title="Jumlah Rumah Terendam Banjir">
                         <i className="fa-solid fa-house-flood-water text-[10px] text-cyan-400 w-4 text-center"></i>
                         <span className={`text-2xl font-orbitron font-black min-w-[30px] text-center ${event.total_rumah_terendam > 0 ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]' : 'text-gray-400'}`}>
                           {event.total_rumah_terendam || 0}
                         </span>
                         <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest w-8">TRD</span>
                       </div>
 
                       <div className={`flex items-center gap-2 w-full cursor-help transition-opacity ${event.total_fasum_rusak > 0 ? 'opacity-100' : 'opacity-30'}`} title="Fasilitas Umum / Sosial Rusak">
                         <i className="fa-solid fa-building-circle-exclamation text-[10px] text-emerald-400 w-4 text-center"></i>
                         <span className={`text-2xl font-orbitron font-black min-w-[30px] text-center ${event.total_fasum_rusak > 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-gray-400'}`}>
                           {event.total_fasum_rusak || 0}
                         </span>
                         <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest w-8">FSM</span>
                       </div>
                     </div>
                   </div>
                </div>
              ))}

             {history.length === 0 && !loading && (
               <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-3xl w-full">
                 <i className="fa-solid fa-database text-4xl text-white/5 mb-4"></i>
                 <div className="text-[12px] text-gray-600 font-black uppercase tracking-[0.3em]">No Disaster Records in this Sector</div>
               </div>
             )}
           </div>

           {/* Tactical Footer / Pagination */}
           <div className="p-4 border-t border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 justify-between items-center rounded-b-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b6d4]" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Showing <span className="text-white">{paginatedHistory.length}</span> of <span className="text-white">{history.length}</span> verified events
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1 || loading}
                  className="px-4 h-9 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all uppercase font-black tracking-widest"
                >
                  Prev
                </button>
                
                <div className="flex items-center gap-1.5 mx-2">
                  {renderPagination()}
                </div>

                <button 
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || loading}
                  className="px-4 h-9 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all uppercase font-black tracking-widest"
                >
                  Next
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
