import React from 'react';
import type { TrafficAccident } from '../../hooks/useTrafficAccidentData';

interface AccidentTableProps {
  accidents: TrafficAccident[];
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
  pagination: { total: number, totalPages: number } | null;
  search: string;
  setSearch: (s: string) => void;
  province: string;
  setProvince: (p: string) => void;
  injuryStatus: string;
  setInjuryStatus: (s: string) => void;
  victimStatus: string;
  setVictimStatus: (s: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  refresh: () => void;
}

export const AccidentTable: React.FC<AccidentTableProps> = ({ 
  accidents, 
  isLoading, 
  page, 
  setPage, 
  pagination,
  search,
  setSearch,
  province,
  setProvince,
  injuryStatus, 
  setInjuryStatus, 
  victimStatus,
  setVictimStatus,
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate, 
  refresh
}) => {
  const totalPages = pagination?.totalPages || 1;
  const provinces = [
    'Nasional', 'DKI JAKARTA', 'JAWA BARAT', 'JAWA TENGAH', 'JAWA TIMUR', 
    'BALI', 'BANTEN', 'NUSA TENGGARA TIMUR', 'SUMATERA UTARA'
  ];

  const victimRoleOptions = [
    { label: 'Semua Peran', value: 'Semua' },
    { label: 'PENGENDARA', value: 'PENGENDARA' },
    { label: 'PENUMPANG', value: 'PENUMPANG' },
    { label: 'PEJALAN KAKI', value: 'PEJALAN KAKI' },
    { label: 'PEMBONCENG', value: 'PEMBONCENG' }
  ];

  const conditionOptions = [
    { label: 'Semua Kondisi', value: 'Semua' },
    { label: 'Meninggal Dunia', value: 'MD' },
    { label: 'Luka Luka', value: 'LL' },
    { label: 'Tanpa Kondisi', value: '' }
  ];

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(
        <button key={1} onClick={() => setPage(1)} className={`w-8 h-8 rounded border transition-all text-xs font-bold ${page === 1 ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>1</button>
      );
      if (start > 2) pages.push(<span key="dots1" className="text-gray-600 px-1">...</span>);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => setPage(i)} 
          className={`w-8 h-8 rounded border transition-all text-xs font-bold ${page === i ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="dots2" className="text-gray-600 px-1">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => setPage(totalPages)} className={`w-8 h-8 rounded border transition-all text-xs font-bold ${page === totalPages ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-white/5 text-gray-400 border-white/10'}`}>{totalPages}</button>
      );
    }

    return pages;
  };

  return (
    <div className="flex flex-col h-full bg-[#0d121f]/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
      {/* Unified Tactical Command Header */}
      <div className="p-4 border-b border-white/5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" />
            <h2 className="font-orbitron text-lg font-black text-white tracking-widest uppercase truncate">Traffic Log</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-black/40 px-4 py-3 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner hover:border-white/10">
              <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3">Kondisi</span>
              <select 
                value={injuryStatus} 
                onChange={(e) => setInjuryStatus(e.target.value)} 
                className="bg-transparent text-sm font-black text-white focus:outline-none cursor-pointer uppercase font-orbitron hover:text-cyan-400 transition-colors"
              >
                {conditionOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0d121f]">{opt.label}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 bg-black/40 px-4 py-3 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner hover:border-white/10">
              <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3">Peran</span>
              <select 
                value={victimStatus} 
                onChange={(e) => setVictimStatus(e.target.value)} 
                className="bg-transparent text-sm font-black text-white focus:outline-none cursor-pointer uppercase font-orbitron hover:text-cyan-400 transition-colors"
              >
                {victimRoleOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0d121f]">{opt.label}</option>)}
              </select>
            </div>
            
            <button 
              onClick={refresh}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all active:scale-95"
            >
              <i className="fa-solid fa-rotate text-sm"></i>
            </button>
          </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 relative group">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors text-base" />
            <input 
              type="text"
              placeholder="Search victim, city, polres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-3.5 pl-12 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all font-mono"
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
            <div className="flex items-center gap-3 bg-black/40 px-4 py-3 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner">
              <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3">Range</span>
              <div className="flex items-center gap-3">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-sm text-white focus:outline-none uppercase font-mono cursor-pointer hover:text-cyan-400 transition-colors" />
                <span className="text-gray-600 font-bold">/</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-sm text-white focus:outline-none uppercase font-mono cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/40 px-4 py-3 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner">
              <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3">Region</span>
              <select value={province} onChange={(e) => setProvince(e.target.value)} className="bg-transparent text-sm font-black text-white focus:outline-none cursor-pointer uppercase font-orbitron hover:text-cyan-400 transition-colors">
                {provinces.map(p => <option key={p} value={p} className="bg-[#0d121f]">{p}</option>)}
              </select>
            </div>

            <div className="flex flex-col items-end shrink-0 ml-auto border-l-2 border-white/5 pl-6 min-w-[120px]">
              <span className="text-sm text-gray-500 font-black tracking-widest uppercase mb-0.5">{pagination?.total || 0} Records</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-xs text-cyan-500/60 font-mono font-bold tracking-tighter">PAGE {page}/{totalPages}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto ews-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead className="sticky top-0 bg-[#0d121f] z-10">
            <tr className="border-b border-white/10">
              <th className="p-4 text-xs font-black text-cyan-500/60 uppercase tracking-widest min-w-[150px]">Waktu & Lokasi</th>
              <th className="p-4 text-xs font-black text-cyan-500/60 uppercase tracking-widest min-w-[180px]">Detail Korban</th>
              <th className="p-4 text-xs font-black text-cyan-500/60 uppercase tracking-widest min-w-[300px]">Deskripsi Kejadian</th>
              <th className="p-4 text-xs font-black text-cyan-500/60 uppercase tracking-widest min-w-[120px]">Status</th>
              <th className="p-4 text-xs font-black text-cyan-500/60 uppercase tracking-widest min-w-[150px]">Petugas</th>
              <th className="p-4 text-xs font-black text-cyan-500/60 uppercase tracking-widest text-right min-w-[180px]">Laporan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="p-8"><div className="h-4 bg-white/5 rounded w-full" /></td>
                </tr>
              ))
            ) : accidents.map((acc) => (
              <tr key={acc.id} className="hover:bg-white/[0.03] transition-colors group align-top">
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white whitespace-nowrap">{new Date(acc.accident_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-tight font-black">{acc.city_name}</span>
                    <span className="text-[11px] text-cyan-500/50 font-mono">{acc.polres}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-amber-400 group-hover:text-amber-300 transition-colors uppercase leading-tight tracking-wide">{acc.victim_name}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded border border-white/5 font-black uppercase tracking-tighter">{acc.victim_status}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="max-w-[400px]">
                    <p className="text-xs text-gray-400 leading-relaxed italic whitespace-normal">
                      "{acc.location_description}"
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                    acc.injury_status === 'MD' ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
                    acc.injury_status === 'LL' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 
                    'bg-gray-500/10 text-gray-400 border-white/10'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                      acc.injury_status === 'MD' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
                      acc.injury_status === 'LL' ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' :
                      'bg-gray-500'
                    }`} />
                    {acc.injury_status === 'MD' ? 'Meninggal Dunia' : acc.injury_status === 'LL' ? 'Luka Luka' : 'Tanpa Kondisi'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_5px_#06b6d4]" />
                    <span className="text-xs font-black text-gray-300 uppercase tracking-wide">{acc.officer_name || '-'}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400 font-mono tracking-tighter bg-white/5 px-2 py-0.5 rounded border border-white/5">{acc.report_number}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500 font-bold flex gap-3">
              <span className="flex items-center gap-1.5 uppercase tracking-tighter"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" /> MD</span>
              <span className="flex items-center gap-1.5 uppercase tracking-tighter"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]" /> LL</span>
              <span className="flex items-center gap-1.5 uppercase tracking-tighter"><div className="w-1.5 h-1.5 rounded-full bg-gray-600" /> T/K</span>
          </div>
          <div className="h-4 w-[1px] bg-white/5 hidden md:block" />
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              className="px-3 h-8 bg-white/5 border border-white/10 rounded text-xs text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all uppercase font-black"
            >
              Prev
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              {renderPagination()}
            </div>

            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
              className="px-3 h-8 bg-white/5 border border-white/10 rounded text-xs text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all uppercase font-black"
            >
              Next
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-500/80 font-black uppercase tracking-[0.2em]">{isLoading ? 'Syncing Radar...' : 'Real-time Sync'}</span>
        </div>
      </div>
    </div>
  );
};
