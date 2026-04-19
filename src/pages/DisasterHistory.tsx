import { useDisasterData } from '../hooks/useDisasterData';
import CountUp from '../components/CountUp';
import TacticalCard from '../components/CommandCenter/shared/TacticalCard';

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
    setEndDate
  } = useDisasterData();


  const categories = [
    'Semua', 'BANJIR', 'CUACA EKSTREM', 'TANAH LONGSOR', 
    'KEBAKARAN HUTAN DAN LAHAN', 'KEKERINGAN', 'GEMPABUMI'
  ];

  const provinces = [
    'Nasional', 'ACEH', 'SUMATERA UTARA', 'SUMATERA BARAT', 'RIAU', 'JAMBI', 
    'SUMATERA SELATAN', 'BENGKULU', 'LAMPUNG', 'KEP. BANGKA BELITUNG', 'KEP. RIAU', 
    'DKI JAKARTA', 'JAWA BARAT', 'JAWA TENGAH', 'DI YOGYAKARTA', 'JAWA TIMUR', 
    'BANTEN', 'BALI', 'NUSA TENGGARA BARAT', 'NUSA TENGGARA TIMUR'
  ];

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
    
    // 1. Initial cleanup
    let clean = loc
      .replace(/Kecamatan:[\/|\\]n/gi, '')
      .replace(/[\/|\\]n/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (clean.toUpperCase() === category.toUpperCase()) {
      return [];
    }

    // 2. Split by "Kec." safely
    const parts = clean.split(/(?=Kec\.)|(?=Kecamatan )/gi);
    
    return parts
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => p.toUpperCase());
  };

  return (
    <div className="space-y-6 ews-animate-fade-in">
      {/* HERO STATS - REAL AGGREGATION */}
      <div className="grid grid-cols-4 gap-6">
        <div className="ews-card p-6 border-l-4 border-red-600 bg-red-500/[0.02]">
          <div className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">Total Meninggal</div>
          <div className="font-orbitron text-4xl font-black text-red-500 leading-none">
            <CountUp value={Number(stats?.deaths || 0)} />
          </div>
          <div className="mt-3 flex items-center gap-2">
             <span className="text-[10px] text-red-500/60 font-mono tracking-widest uppercase">Casualty Log</span>
             <div className="flex-1 h-px bg-red-500/10" />
          </div>
        </div>

        <div className="ews-card p-6 border-l-4 border-amber-600 bg-amber-500/[0.02]">
          <div className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">Korban Luka</div>
          <div className="font-orbitron text-4xl font-black text-amber-500 leading-none">
            <CountUp value={Number(stats?.injured || 0)} />
          </div>
          <div className="mt-3 flex items-center gap-2">
             <span className="text-[10px] text-amber-500/60 font-mono tracking-widest uppercase">Medical Response</span>
             <div className="flex-1 h-px bg-amber-500/10" />
          </div>
        </div>

        <div className="ews-card p-6 border-l-4 border-cyan-600 bg-cyan-500/[0.02]">
          <div className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">Rumah Terdampak</div>
          <div className="font-orbitron text-4xl font-black text-cyan-400 leading-none">
            <CountUp value={Number(stats?.damage || 0)} />
          </div>
          <div className="mt-3 flex items-center gap-2">
             <span className="text-[10px] text-cyan-500/60 font-mono tracking-widest uppercase">Infrastructure</span>
             <div className="flex-1 h-px bg-cyan-500/10" />
          </div>
        </div>

        <div className="ews-card p-6 border-l-4 border-emerald-600 bg-emerald-500/[0.02]">
          <div className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">Total Kejadian</div>
          <div className="font-orbitron text-4xl font-black text-emerald-400 leading-none">
            <CountUp value={Number(stats?.total_events || 0)} />
          </div>
          <div className="mt-3 flex items-center gap-2">
             <span className="text-[10px] text-emerald-500/60 font-mono tracking-widest uppercase">Event Record</span>
             <div className="flex-1 h-px bg-emerald-500/10" />
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-y-4 gap-x-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-filter text-cyan-500/50 text-xs"></i>
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Wilayah:</span>
        </div>
        <select 
          className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-[12px] text-white uppercase tracking-widest outline-none focus:border-cyan-500/50 transition-all font-bold"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <div className="w-px h-8 bg-white/5 mx-2" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Kategori:</span>
        </div>
        <select 
          className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-[12px] text-white uppercase tracking-widest outline-none focus:border-cyan-500/50 transition-all font-bold"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="w-px h-8 bg-white/5 mx-2" />

        <div className="flex items-center gap-2">
          <i className="fa-solid fa-calendar-days text-cyan-500/50 text-xs"></i>
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Rentang Tanggal:</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white outline-none focus:border-cyan-500/50 transition-all font-bold selection:bg-cyan-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">— TO —</span>
          <input 
            type="date" 
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-[11px] text-white outline-none focus:border-cyan-500/50 transition-all font-bold selection:bg-cyan-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* MAIN DATA GRID */}
      <TacticalCard
        headerIcon="fa-solid fa-clock-rotate-left"
        headerTitle="MATRIKS HISTORI BENCANA"
        headerSubtitle={`Log Kejadian Terverifikasi • ${startDate} s/d ${endDate} • ${selectedRegion.toUpperCase()}`}
      >
        <div className="min-h-[600px] relative">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Tactical Data...</span>
              </div>
            </div>
          )}

           <div className="flex flex-col max-h-[1200px] overflow-y-auto ews-scrollbar-hide pr-2">
              {history.map((event) => (
                <div 
                  key={event.id}
                  className="group relative flex items-center gap-6 p-6 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all duration-300"
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
                  <div className="flex flex-col gap-3 min-w-[340px] px-6 py-2 border-l border-white/5">
                    {/* Row 1: Human Impact */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`flex items-center gap-2 ${event.total_meninggal > 0 ? 'opacity-100' : 'opacity-30'}`} title="Meninggal Dunia">
                        <i className="fa-solid fa-skull text-[10px] text-red-500"></i>
                        <span className={`text-2xl font-orbitron font-black ${event.total_meninggal > 0 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-gray-400'}`}>
                          {event.total_meninggal || 0}
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Die</span>
                      </div>

                      <div className={`flex items-center gap-2 ${event.total_hilang > 0 ? 'opacity-100' : 'opacity-30'}`} title="Orang Hilang">
                        <i className="fa-solid fa-person-circle-question text-[10px] text-amber-500"></i>
                        <span className={`text-2xl font-orbitron font-black ${event.total_hilang > 0 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'text-gray-400'}`}>
                          {event.total_hilang || 0}
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Mis</span>
                      </div>

                      <div className={`flex items-center gap-2 ${event.total_terluka > 0 ? 'opacity-100' : 'opacity-30'}`} title="Korban Terluka">
                        <i className="fa-solid fa-user-injured text-[10px] text-blue-400"></i>
                        <span className={`text-2xl font-orbitron font-black ${event.total_terluka > 0 ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]' : 'text-gray-400'}`}>
                          {event.total_terluka || 0}
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Inj</span>
                      </div>
                    </div>

                    {/* Divider line (Subtle) */}
                    <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent w-full" />

                    {/* Row 2: Infrastructure Impact */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`flex items-center gap-2 ${event.total_rumah_rusak > 0 ? 'opacity-100' : 'opacity-30'}`} title="Rumah Rusak">
                        <i className="fa-solid fa-house-crack text-[10px] text-orange-400"></i>
                        <span className={`text-2xl font-orbitron font-black ${event.total_rumah_rusak > 0 ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.3)]' : 'text-gray-400'}`}>
                          {event.total_rumah_rusak || 0}
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Dmg</span>
                      </div>

                      <div className={`flex items-center gap-2 ${event.total_rumah_terendam > 0 ? 'opacity-100' : 'opacity-30'}`} title="Rumah Terendam">
                        <i className="fa-solid fa-house-flood-water text-[10px] text-cyan-400"></i>
                        <span className={`text-2xl font-orbitron font-black ${event.total_rumah_terendam > 0 ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]' : 'text-gray-400'}`}>
                          {event.total_rumah_terendam || 0}
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Wtr</span>
                      </div>

                      <div className={`flex items-center gap-2 ${event.total_fasum_rusak > 0 ? 'opacity-100' : 'opacity-30'}`} title="Fasilitas Umum Rusak">
                        <i className="fa-solid fa-building-circle-exclamation text-[10px] text-emerald-400"></i>
                        <span className={`text-2xl font-orbitron font-black ${event.total_fasum_rusak > 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-gray-400'}`}>
                          {event.total_fasum_rusak || 0}
                        </span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Pub</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {history.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-3xl">
                <i className="fa-solid fa-database text-4xl text-white/5 mb-4"></i>
                <div className="text-[12px] text-gray-600 font-black uppercase tracking-[0.3em]">No Disaster Records in this Sector</div>
              </div>
            )}
          </div>
        </div>
      </TacticalCard>
    </div>
  );
}
