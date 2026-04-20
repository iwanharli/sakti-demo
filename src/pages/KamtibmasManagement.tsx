import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore, getApiBase, authFetch } from '../store/useAppStore';
import CountUp from '../components/CountUp';

export default function KamtibmasManagement() {
  const addToast = useAppStore((s) => s.addToast);
  const [showTacticalLegend, setShowTacticalLegend] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePolda, setActivePolda] = useState('Nasional');
  const [activeClassification, setActiveClassification] = useState('Semua');
  const [poldaList, setPoldaList] = useState<string[]>([]);
  const [classList, setClassList] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toLocaleDateString('en-CA');
  });
  const [endDate, setEndDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [activeRiskLevel, setActiveRiskLevel] = useState('Semua');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 10
  });
  
  // Custom Dropdown State
  const [isPoldaOpen, setIsPoldaOpen] = useState(false);
  const [poldaSearch, setPoldaSearch] = useState('');
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [classSearch, setClassSearch] = useState('');
  const [isRiskOpen, setIsRiskOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPoldaList();
    fetchClassList();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchData();
  }, [activePolda, activeClassification, startDate, endDate, activeRiskLevel]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const filteredPoldaList = poldaList.filter(p => 
    p.toLowerCase().includes(poldaSearch.toLowerCase())
  );

  const fetchPoldaList = async () => {
    try {
      const res = await authFetch(`${getApiBase()}/kamtibmas/polda-list`);
      const data = await res.json();
      setPoldaList(['Nasional', ...data]);
    } catch (err) {
      console.error('Error fetching Polda list:', err);
    }
  };

  const fetchClassList = async () => {
    try {
      const res = await authFetch(`${getApiBase()}/kamtibmas/classifications`);
      const data = await res.json();
      setClassList(['Semua', ...data]);
    } catch (err) {
      console.error('Error fetching classification list:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const poldaQuery = activePolda === 'Nasional' ? '' : `polda=${encodeURIComponent(activePolda)}`;
      const classQuery = activeClassification === 'Semua' ? '' : `classification=${encodeURIComponent(activeClassification)}`;
      const riskQuery = activeRiskLevel === 'Semua' ? '' : `risk=${encodeURIComponent(activeRiskLevel)}`;
      const startQuery = startDate ? `startDate=${startDate}` : '';
      const endQuery = endDate ? `endDate=${endDate}` : '';
      const pageQuery = `page=${currentPage}`;
      const limitQuery = `limit=10`;
      
      const queryStr = [poldaQuery, classQuery, riskQuery, startQuery, endQuery, pageQuery, limitQuery].filter(Boolean).join('&');
      const statsStr = [poldaQuery, classQuery, riskQuery, startQuery, endQuery].filter(Boolean).join('&');
      
      const statsQuery = statsStr ? `?${statsStr}` : '';
      const matrixQuery = queryStr ? `?${queryStr}` : '';
      
      const [statsRes, casesRes] = await Promise.all([
        authFetch(`${getApiBase()}/kamtibmas/stats${statsQuery}`),
        authFetch(`${getApiBase()}/kamtibmas/recent-cases${matrixQuery}`)
      ]);

      const statsData = await statsRes.json();
      const casesData = await casesRes.json();

      setStats(statsData);
      setRecentCases(casesData.data || []);
      setPagination(casesData.pagination || { total: 0, totalPages: 0, limit: 20 });
    } catch (err) {
      console.error('Error fetching data:', err);
      addToast('Gagal memuat data Kamtibmas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusPillClass = (count: number) => {
    if (count > 50) return 'bg-red-500/15 text-red-400 border border-red-500/30';
    if (count > 20) return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
  };

  const getCrimeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('konvensional')) return '#f59e0b'; // Amber
    if (t.includes('transnasional')) return '#ef4444'; // Red
    if (t.includes('kekayaan_negara')) return '#a855f7'; // Purple
    if (t.includes('kontinjensi')) return '#10b981'; // Emerald
    if (t.includes('pelanggaran')) return '#06b6d4'; // Cyan
    if (t.includes('bencana')) return '#10b981'; // Emerald
    if (t.includes('gangguan')) return '#3b82f6'; // Blue
    if (t.includes('total')) return '#3b82f6'; // Blue
    return '#94a3b8'; // Slate
  };

  const getCrimeClass = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('konvensional')) return 'ews-tag-amber';
    if (t.includes('transnasional')) return 'ews-tag-red';
    if (t.includes('kekayaan_negara')) return 'ews-tag-purple';
    if (t.includes('kontinjensi')) return 'ews-tag-green';
    if (t.includes('pelanggaran')) return 'ews-tag-cyan';
    if (t.includes('bencana')) return 'ews-tag-green';
    if (t.includes('gangguan')) return 'ews-tag-blue';
    return 'ews-tag-cyan';
  };

  const crimeDistribution = stats ? [
    { name: 'Konvensional', value: stats.konvensional, color: '#f59e0b' },
    { name: 'Transnasional', value: stats.transnasional, color: '#ef4444' },
    { name: 'Kekayaan Negara', value: stats.kekayaan_negara, color: '#a855f7' },
    { name: 'Pelanggaran', value: stats.pelanggaran, color: '#06b6d4' }
  ].filter(c => c.value > 0) : [];

  const totalValue = crimeDistribution.reduce((acc, curr) => acc + Number(curr.value), 0);

  const getDayDiff = () => {
    if (!startDate || !endDate) return 3;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const dayLabel = `${getDayDiff()} Hari`;
  
  const refresh = () => {
    fetchData();
    addToast('Sinkronisasi Data Taktis...', 'info');
  };

  const resetFilters = () => {
    setActivePolda('Nasional');
    setActiveClassification('Semua');
    setActiveRiskLevel('Semua');
    
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setStartDate(start.toLocaleDateString('en-CA'));
    setEndDate(end.toLocaleDateString('en-CA'));
    setCurrentPage(1);
    addToast('Parameter Filter Direset', 'info');
  };

  return (
    <div className={`space-y-6 ${mounted ? 'ews-animate-fade-in' : ''}`}>
      {/* HUD STATS GRID */}
      <div className="grid grid-cols-4 gap-5 mb-8 relative z-10">
        <div className="ews-stat-card red">
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Total Kejadian Kamtibmas ({dayLabel})</div>
          <div className="font-orbitron text-4xl font-bold text-red-500 mb-1">
            <CountUp value={stats?.total_kamtibmas || 0} />
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-red-400 uppercase font-black">INDEKS NASIONAL</span>
            <span className="text-gray-500 italic">Polda {activePolda}</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-red-500">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
        </div>

        <div className="ews-stat-card amber">
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Total Unjuk Rasa ({dayLabel})</div>
          <div className="font-orbitron text-4xl font-bold text-amber-500 mb-1">
            <CountUp value={stats?.total_demo || 0} />
          </div>
          <div className="text-[13px] text-gray-500 italic">Kejadian Terdeteksi</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-amber-500">
            <i className="fa-solid fa-bullhorn"></i>
          </div>
        </div>

        <div className="ews-stat-card green">
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Estimasi Massa ({dayLabel})</div>
          <div className="font-orbitron text-4xl font-bold text-emerald-400 mb-1">
            <CountUp value={stats?.total_massa || 0} />
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-emerald-400 uppercase font-black">PERSONS</span>
            <span className="text-gray-500 italic">Kekuatan Massa</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-emerald-500">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>

        <div className="ews-stat-card cyan">
          <div className="text-[12px] text-gray-500 uppercase tracking-wider mb-2">Kekuatan Personel ({dayLabel})</div>
          <div className="font-orbitron text-3xl font-bold text-cyan-400 mb-1">
            <CountUp value={Number(stats?.pam_polri || 0) + Number(stats?.pam_tni || 0) + Number(stats?.pam_lainnya || 0)} />
          </div>
          <div className="text-[11px] text-gray-500 font-mono uppercase">
            {stats?.total_massa > 0 
              ? (Number(stats?.pam_polri || 0) + Number(stats?.pam_tni || 0) + Number(stats?.pam_lainnya || 0)) >= stats?.total_massa
                ? <><span className="text-amber-400">{((Number(stats?.pam_polri || 0) + Number(stats?.pam_tni || 0) + Number(stats?.pam_lainnya || 0)) / stats?.total_massa).toFixed(1)}</span> Petugas / 1 Massa</>
                : <>1 Petugas / <span className="text-amber-400">{(stats?.total_massa / (Number(stats?.pam_polri || 0) + Number(stats?.pam_tni || 0) + Number(stats?.pam_lainnya || 0) || 1)).toFixed(1)}</span> Massa</>
              : 'Siaga Penuh (Tanpa Massa)'
            }
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-20 text-cyan-500">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
        </div>
      </div>

      {/* TACTICAL CASE MATRIX - Unified Tactical Design */}
      <div className="flex flex-col bg-[#0d121f]/40 backdrop-blur-md rounded-2xl border border-white/5 relative group/table z-[30]">
        {/* Command Header */}
        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
          {/* Row 1: Identity & Support */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" />
              <h2 className="text-xl font-bold text-white tracking-widest uppercase truncate leading-none font-orbitron">Repositori Kriminal Nasional</h2>
            </div>

            <div className="flex items-center gap-2 relative z-[60]">
              <button 
                onClick={refresh}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all active:scale-95 shadow-inner"
                title="Refresh Dashboard"
              >
                <i className="fa-solid fa-rotate text-sm" />
              </button>
              <button 
                onClick={resetFilters}
                className="px-4 h-10 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 transition-all active:scale-95 shadow-inner"
                title="Reset All Filters"
              >
                <i className="fa-solid fa-filter-circle-xmark text-sm" />
                <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Row 2: Tactical Parameters */}
          <div className="flex flex-wrap items-center gap-4 justify-end ml-auto">
            {/* Searchable Dropdown for Polda */}
            <div className="flex items-center gap-3 bg-black/80 px-4 py-1 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner relative group/polda">
              <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3 whitespace-nowrap">Wilayah</span>
              <button 
                onClick={() => setIsPoldaOpen(!isPoldaOpen)}
                className="flex items-center gap-2 py-2 min-w-[140px] text-left"
              >
                <span className="font-orbitron font-bold text-[13px] text-white tracking-widest uppercase truncate max-w-[200px]">
                  {activePolda}
                </span>
                <i className={`fa-solid fa-chevron-down text-[8px] transition-transform duration-300 ml-auto ${isPoldaOpen ? 'rotate-180 text-cyan-400' : 'text-gray-600'}`}></i>
              </button>

              {/* Dropdown Menu */}
              {isPoldaOpen && (
                <>
                  <div className="fixed inset-0 z-[80]" onClick={() => setIsPoldaOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-72 bg-[#0d121f] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden ews-animate-scale-up">
                    <div className="p-3 border-b border-white/5 bg-white/5">
                      <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-[10px]"></i>
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="CARI POLDA..."
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                          value={poldaSearch}
                          onChange={(e) => setPoldaSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto ews-scrollbar">
                      {filteredPoldaList.map((polda) => (
                        <button
                          key={polda}
                          onClick={() => {
                            setActivePolda(polda);
                            setIsPoldaOpen(false);
                            setPoldaSearch('');
                          }}
                          className={`w-full flex items-center justify-between px-6 py-3 hover:bg-cyan-500/10 transition-colors group ${
                            activePolda === polda ? 'bg-cyan-500/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <i className={`fa-solid fa-circle-dot text-[6px] ${activePolda === polda ? 'text-cyan-400' : 'text-gray-700 group-hover:text-gray-500'}`} />
                            <span className={`text-[11px] font-bold tracking-widest uppercase text-left ${
                              activePolda === polda ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'
                            }`}>
                              {polda}
                            </span>
                          </div>
                          {activePolda === polda && <i className="fa-solid fa-check text-[8px] text-cyan-400"></i>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Classification Dropdown */}
            <div className="flex items-center gap-3 bg-black/80 px-4 py-1 rounded-2xl border-2 border-white/5 focus-within:border-amber-500/30 transition-all shadow-inner relative group/class">
              <span className="text-[11px] text-amber-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3 whitespace-nowrap">Klasifikasi</span>
              <button 
                onClick={() => setIsClassOpen(!isClassOpen)}
                className="flex items-center gap-2 py-2 min-w-[180px] text-left"
              >
                <span className="font-orbitron font-bold text-[13px] tracking-widest uppercase truncate max-w-[240px]" style={{ color: getCrimeColor(activeClassification) }}>
                  {activeClassification === 'Semua' ? 'SEMUA KLASIFIKASI' : activeClassification.replace(/_/g, ' ')}
                </span>
                <i className={`fa-solid fa-chevron-down text-[8px] transition-transform duration-300 ml-auto ${isClassOpen ? 'rotate-180 text-amber-400' : 'text-gray-600'}`}></i>
              </button>

              {/* Dropdown Menu */}
              {isClassOpen && (
                <>
                  <div className="fixed inset-0 z-[80]" onClick={() => setIsClassOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-[#0d121f] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden ews-animate-scale-up">
                    <div className="p-3 border-b border-white/5 bg-white/5">
                      <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-[10px]"></i>
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="CARI KLASIFIKASI..."
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-white focus:outline-none focus:border-amber-500/50 font-mono"
                          value={classSearch}
                          onChange={(e) => setClassSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto ews-scrollbar">
                      {classList.filter(c => c.toLowerCase().includes(classSearch.toLowerCase())).map((cls) => (
                        <button
                          key={cls}
                          onClick={() => {
                            setActiveClassification(cls);
                            setIsClassOpen(false);
                            setClassSearch('');
                          }}
                          className={`w-full flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors group ${
                            activeClassification === cls ? 'bg-white/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-3 shrink-0 rounded-full" style={{ backgroundColor: getCrimeColor(cls) }} />
                            <span className={`text-[10px] font-black tracking-widest uppercase text-left break-words ${
                              activeClassification === cls ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                            }`}>
                              {cls === 'Semua' ? 'ALL' : cls.replace(/kejahatan_/g, '').replace(/_total/g, '').replace(/_/g, ' ')}
                            </span>
                          </div>
                          {activeClassification === cls && <div className="shrink-0 ml-2"><i className="fa-solid fa-check text-[8px] text-amber-400"></i></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Risk Level Dropdown */}
            <div className="flex items-center gap-3 bg-black/80 px-4 py-1 rounded-2xl border-2 border-white/5 focus-within:border-blue-500/30 transition-all shadow-inner relative group/risk">
              <span className="text-[11px] text-blue-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3 whitespace-nowrap">Risiko</span>
              <button 
                onClick={() => setIsRiskOpen(!isRiskOpen)}
                className="flex items-center gap-2 py-2 min-w-[120px] text-left"
              >
                <span className={`font-orbitron font-bold text-[13px] tracking-widest uppercase truncate max-w-[150px] ${
                  activeRiskLevel === 'Tinggi' ? 'text-red-500' : 
                  activeRiskLevel === 'Waspada' ? 'text-amber-500' : 
                  activeRiskLevel === 'Normal' ? 'text-cyan-400' : 'text-gray-400'
                }`}>
                  {activeRiskLevel === 'Semua' ? 'SEMUA RISIKO' : activeRiskLevel}
                </span>
                <i className={`fa-solid fa-chevron-down text-[8px] transition-transform duration-300 ml-auto ${isRiskOpen ? 'rotate-180 text-blue-400' : 'text-gray-600'}`}></i>
              </button>

              {/* Dropdown Menu */}
              {isRiskOpen && (
                <>
                  <div className="fixed inset-0 z-[80]" onClick={() => setIsRiskOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-[#0d121f] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden ews-animate-scale-up">
                    <div className="max-h-60 overflow-y-auto ews-scrollbar">
                      {['Semua', 'Tinggi', 'Waspada', 'Normal'].map((risk) => (
                        <button
                          key={risk}
                          onClick={() => {
                            setActiveRiskLevel(risk);
                            setIsRiskOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors group ${
                            activeRiskLevel === risk ? 'bg-white/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              risk === 'Tinggi' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 
                              risk === 'Waspada' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 
                              risk === 'Normal' ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 'bg-gray-600'
                            }`} />
                            <span className={`text-[11px] font-black tracking-widest uppercase text-left ${
                              activeRiskLevel === risk ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                            }`}>
                              {risk === 'Semua' ? 'ALL LEVELS' : risk}
                            </span>
                          </div>
                          {activeRiskLevel === risk && <i className="fa-solid fa-check text-[8px] text-blue-400"></i>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-3 bg-black/80 px-4 py-1 rounded-2xl border-2 border-white/5 focus-within:border-cyan-500/30 transition-all shadow-inner relative group/date">
              <span className="text-[11px] text-cyan-500/60 font-black uppercase tracking-widest border-r border-white/10 pr-3 whitespace-nowrap">Periode</span>
              <div className="flex items-center gap-4 py-2">
                <div className="flex flex-col gap-0.5">
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-[12px] font-orbitron font-bold text-white focus:outline-none [color-scheme:dark] cursor-pointer"
                  />
                </div>
                
                <div className="w-4 h-px bg-gray-800" />
                
                <div className="flex flex-col gap-0.5">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-[12px] font-orbitron font-bold text-white focus:outline-none [color-scheme:dark] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-2 relative z-20">
          <table className="w-full border-separate border-spacing-y-1.5">
            <thead className="sticky top-0 z-20 bg-[#070a12]/90 backdrop-blur-md">
              <tr className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.15em]">
                <th className="text-left py-4 pl-12 border-b border-gray-800">No. ID</th>
                <th className="text-left py-4 border-b border-gray-800">Klasifikasi</th>
                <th className="text-left py-4 border-b border-gray-800">Wilayah (Polda)</th>
                <th className="text-left py-4 border-b border-gray-800">Tanggal Lapor</th>
                <th className="text-left py-4 border-b border-gray-800">Tingkat Risiko</th>
                <th className="text-right py-4 pr-12 border-b border-gray-800">Jumlah Kasus</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((caseItem) => (
                <tr 
                  key={caseItem.id} 
                  className="group cursor-pointer transition-all duration-300"
                >
                  
                  <td className="bg-gray-900/40 border-y border-l border-gray-800 group-hover:bg-[#070a12] group-hover:border-cyan-500/40 group-hover:shadow-[inset_4px_0_0_#06b6d4] transition-all rounded-l-2xl pl-12 py-8 relative">
                    <div className="flex items-center gap-4">
                      <div className="w-1 h-8 bg-cyan-500/20 group-hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0)] group-hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] transition-all rounded-full" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-mono tracking-tighter mb-1 uppercase">REC_ID</span>
                        <span className="font-mono font-bold text-base text-cyan-400 tracking-wider">#{caseItem.id.toString().slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>

                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-[#070a12] group-hover:border-cyan-500/40 transition-all py-8 px-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Classification</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-widest flex items-center gap-2 border bg-black/40 shadow-inner group-hover:shadow-[0_0_10px_rgba(255,255,255,0.05)] transition-all ${getCrimeClass(caseItem.type)}`} style={{ borderLeftWidth: '4px' }}>
                          <i className="fa-solid fa-shield-halved text-[10px] opacity-70"></i>
                          {caseItem.type?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-[#070a12] group-hover:border-cyan-500/40 transition-all py-8 px-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Deployment_Zone</span>
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <i className="fa-solid fa-map-location-dot text-[10px] text-gray-400"></i>
                        </div>
                        <span className="text-sm text-gray-200 font-bold font-rajdhani tracking-wide uppercase">{caseItem.location}</span>
                      </div>
                    </div>
                  </td>

                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-[#070a12] group-hover:border-cyan-500/40 transition-all py-8 px-4">
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-gray-300">
                          <i className="fa-regular fa-clock text-[10px] text-gray-600"></i>
                          <span className="font-orbitron text-[13px] font-bold tracking-tight">{new Date(caseItem.date).toLocaleDateString()}</span>
                        </div>
                     </div>
                  </td>

                  <td className="bg-gray-900/40 border-y border-gray-800 group-hover:bg-[#070a12] group-hover:border-cyan-500/40 transition-all py-8 px-4">
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-3">
                          <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black tracking-widest uppercase flex items-center gap-2 shadow-inner transition-all duration-500 ${
                            caseItem.count > 30 
                            ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] group-hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]' 
                            : caseItem.count > 10
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                            : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                          }`}>
                             <span className={`w-1.5 h-1.5 rounded-full ${caseItem.count > 30 ? 'bg-red-500 animate-pulse' : caseItem.count > 10 ? 'bg-amber-500 animate-pulse' : 'bg-cyan-500'}`} />
                             {caseItem.count > 30 ? 'TINGGI' : caseItem.count > 10 ? 'WASPADA' : 'NORMAL'}
                          </div>
                       </div>
                    </div>
                  </td>

                  <td className="bg-gray-900/40 border-y border-r border-gray-800 group-hover:bg-[#070a12] group-hover:border-cyan-500/40 transition-all rounded-r-2xl pr-12 py-8 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-end gap-1">
                        <span className={`font-orbitron font-bold text-2xl tracking-tighter ${getStatusPillClass(caseItem.count).split(' ')[1]}`}>
                          {caseItem.count}
                        </span>
                        <span className="text-[10px] text-gray-600 font-bold mb-1 ml-1">KASUS</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentCases.length === 0 && !loading && (
            <div className="py-20 text-center text-gray-600 font-orbitron uppercase tracking-widest">
              DATA TIDAK DITEMUKAN
            </div>
          )}
        </div>

        {/* TACTICAL COMMAND FOOTER - Pagination & Stream Status */}
        <div className="mt-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 shadow-2xl">
          {/* Stream Status & Progress */}
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]" />
                <span className="text-[10px] text-cyan-500/80 font-mono uppercase tracking-[0.2em]">Live_Stream_Status</span>
              </div>
              <div className="px-4 py-2 bg-black/40 rounded-xl border border-white/5 shadow-inner">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">
                  Showing <span className="text-cyan-400 font-mono">{(currentPage - 1) * pagination.limit + 1}</span> — <span className="text-cyan-400 font-mono">{Math.min(currentPage * pagination.limit, pagination.total)}</span> <span className="text-gray-600 mx-1">of</span> <span className="text-white font-mono">{pagination.total}</span> <span className="text-gray-600 ml-1">Entries</span>
                </span>
              </div>
            </div>

            {/* Visual Progress Bar (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col gap-1.5 min-w-[120px]">
              <div className="flex justify-between text-[9px] font-mono text-gray-600 uppercase tracking-tighter">
                <span>Densely_Mapped</span>
                <span>{Math.round((currentPage / pagination.totalPages) * 100) || 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-gray-800/50 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_#06b6d4] transition-all duration-700 ease-out"
                  style={{ width: `${(currentPage / pagination.totalPages) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tactical Navigation Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  currentPage === 1 
                  ? 'border-white/5 text-white/5 cursor-not-allowed bg-transparent' 
                  : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500 hover:text-gray-950 hover:shadow-[0_0_20px_#06b6d4] hover:border-cyan-400 active:scale-90'
                }`}
              >
                <i className="fa-solid fa-chevron-left text-xs" />
              </button>
              
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum = currentPage;
                  if (pagination.totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  if (pageNum <= 0 || pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[36px] h-9 rounded-lg text-[11px] font-black border transition-all duration-300 font-orbitron ${
                        currentPage === pageNum
                        ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_15px_#06b6d4]'
                        : 'border-white/10 text-gray-500 hover:border-white/30 hover:text-white bg-white/5'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                    <div className="flex items-center justify-center w-6 opacity-30">
                      <span className="text-white text-[10px] tracking-widest">• •</span>
                    </div>
                )}
              </div>

              <button
                disabled={currentPage === pagination.totalPages || pagination.total === 0}
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  currentPage === pagination.totalPages || pagination.total === 0
                  ? 'border-white/5 text-white/5 cursor-not-allowed bg-transparent' 
                  : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500 hover:text-gray-950 hover:shadow-[0_0_20px_#06b6d4] hover:border-cyan-400 active:scale-90'
                }`}
              >
                <i className="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>
            
            {/* Direct Jump Info (Label only) */}
            <div className="hidden sm:flex flex-col items-end border-l border-white/10 pl-4">
              <span className="text-[9px] text-gray-600 font-mono uppercase tracking-tighter">Deck_Node</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">P.{currentPage} / {pagination.totalPages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Crime Distribution */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none opacity-20" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <i className="fa-solid fa-chart-pie text-lg"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">KLASIFIKASI KRIMINAL</span>
                <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Metrik Kategori • Distribusi Kasus
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
                <div className="text-[10px] text-cyan-500/60 font-mono">RASIO_KEPADATAN</div>
                <div className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">REF_ID: 0x8F2C</div>
            </div>
          </div>
          <div className="flex items-center gap-10 relative z-10">
            {/* Donut Chart with HUD Marks */}
            <div className="relative group/chart">
              <svg viewBox="0 0 100 100" className="w-48 h-48 flex-shrink-0 drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                {/* Guide Rings */}
                <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="0.5" strokeDasharray="1 3" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(6,182,212,0.05)" strokeWidth="0.5" />
                
                <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(6,182,212,0.05)" strokeWidth="14"/>
                {crimeDistribution.reduce((acc, item, idx) => {
                  const prevTotal = crimeDistribution.slice(0, idx).reduce((sum, i) => sum + i.value, 0);
                  const circumference = 2 * Math.PI * 35;
                  const dashArray = `${(item.value / (totalValue || 1)) * circumference} ${circumference}`;
                  const dashOffset = -((prevTotal / (totalValue || 1)) * circumference);
                  return [
                    ...acc,
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="14"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-1000"
                      transform="rotate(-90 50 50)"
                    />
                  ];
                }, [] as React.ReactElement[])}
                <circle cx="50" cy="50" r="28" fill="#070a12" className="shadow-inner" />
                <text x="50" y="47" textAnchor="middle" fill="#e8f4ff" fontSize="11" className="font-orbitron font-bold">{stats?.total_kejahatan || 0}</text>
                <text x="50" y="57" textAnchor="middle" fill="rgba(6,182,212,0.5)" fontSize="4" className="font-mono uppercase tracking-[0.2em]">TOTAL_KASUS</text>
              </svg>
            </div>

            {/* Tactical Legend */}
            <div className="flex-1 space-y-4">
              {crimeDistribution.map((item, idx) => (
                <div key={idx} className="group/item">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-gray-500">{item.value.toLocaleString()}</span>
                      <span className="text-[11px] font-mono text-cyan-400 font-bold">{totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ 
                        width: `${totalValue > 0 ? (item.value / totalValue) * 100 : 0}%`,
                        backgroundColor: item.color,
                        boxShadow: `0 0 15px ${item.color}60`
                      }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>
              ))}
              {crimeDistribution.length === 0 && (
                  <div className="py-10 flex flex-col items-center justify-center border border-dashed border-gray-800 rounded-xl">
                      <div className="text-[10px] text-gray-600 font-mono italic uppercase tracking-widest mb-2 overflow-hidden">No_Signal_Detected</div>
                      <div className="w-20 h-0.5 bg-gray-800 rounded-full"></div>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Unjuk Rasa / Demo Analytics */}
        <div className="ews-card p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none opacity-20" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <i className="fa-solid fa-people-group text-lg"></i>
              </div>
              <div>
                <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">WAWASAN UNJUK RASA</span>
                <span className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Monitoring Aktivitas • Sentimen Massa
                </span>
              </div>
            </div>

            <button 
              onClick={() => setShowTacticalLegend(!showTacticalLegend)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-300 ${
                showTacticalLegend 
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                : 'text-gray-400 bg-gray-950/50 border-gray-800 hover:text-amber-500 hover:bg-amber-500/5 hover:border-amber-500/20'
              }`}
            >
              <i className="fa-solid fa-circle-info text-sm"></i>
              <span className="font-orbitron font-bold text-[11px] uppercase tracking-widest whitespace-nowrap">Informasi Status</span>
            </button>

          </div>
          <div className="space-y-6 relative z-10">
            <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800 hover:border-amber-500/30 transition-all">
                <div className="flex justify-between items-end mb-4">
                   <div>
                       <div className="text-[12px] text-gray-500 uppercase font-black tracking-widest mb-1 flex items-center gap-2">
                            Total Massa (3-HARI)
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                       </div>
                        <div className="text-3xl font-orbitron font-bold text-amber-500 tracking-tight">
                            <CountUp value={stats?.total_massa || 0} />
                        </div>
                   </div>
                   {(() => {
                     const field = (() => {
                       const p = Number(stats?.pam_polri || 0) + Number(stats?.pam_tni || 0) + Number(stats?.pam_lainnya || 0);
                       const m = Number(stats?.total_massa || 0);
                       if (m === 0) return { label: 'Aman', color: 'text-emerald-400', icon: 'fa-shield-check', iconColor: 'text-emerald-500' };
                       const ratio = p / m;
                       if (ratio >= 1) return { label: 'Aman', color: 'text-emerald-400', icon: 'fa-shield-check', iconColor: 'text-emerald-500' };
                       if (ratio >= 0.3) return { label: 'Waspada', color: 'text-amber-400', icon: 'fa-triangle-exclamation', iconColor: 'text-amber-500' };
                       return { label: 'Rawan', color: 'text-red-500', icon: 'fa-radiation', iconColor: 'text-red-500' };
                     })();

                     const risk = (() => {
                       const demo = Number(stats?.total_demo || 0);
                       const massa = Number(stats?.total_massa || 0);
                       if (demo > 30 || massa > 10000) return { label: 'Tinggi', color: 'text-red-500' };
                       if (demo > 10 || massa > 5000) return { label: 'Sedang', color: 'text-amber-400' };
                       return { label: 'Rendah', color: 'text-emerald-400' };
                     })();

                     return (
                       <div className="flex items-start gap-4 text-right">
                           <div className="flex flex-col items-end">
                               <div className="text-[11px] text-gray-600 font-mono uppercase tracking-normal">Situasi Lapangan</div>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                    <i className={`fa-solid ${field.icon} ${field.iconColor} text-[10px]`}></i>
                                    <div className={`text-[12px] ${field.color} font-black uppercase tracking-wider`}>{field.label}</div>
                               </div>
                           </div>
                           <div className="w-px h-8 bg-gray-800/50" />
                           <div className="flex flex-col items-end">
                               <div className="text-[11px] text-gray-600 font-mono uppercase tracking-normal">Risiko (3-Hari)</div>
                               <div className={`text-[12px] ${risk.color} font-black uppercase tracking-wider mt-0.5`}>{risk.label}</div>
                           </div>
                       </div>
                     );
                   })()}
                </div>
                {(() => {
                  const p = Number(stats?.pam_polri || 0);
                  const t = Number(stats?.pam_tni || 0);
                  const l = Number(stats?.pam_lainnya || 0);
                  const total = p + t + l || 1;
                  return (
                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-1000" style={{ width: `${(p / total) * 100}%` }}></div>
                      <div className="h-full bg-amber-500 opacity-70 transition-all duration-1000" style={{ width: `${(t / total) * 100}%` }}></div>
                      <div className="h-full bg-purple-500 opacity-60 transition-all duration-1000" style={{ width: `${(l / total) * 100}%` }}></div>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-800/30">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                            <span className="text-[11px] text-gray-500 font-black tracking-widest uppercase">POLRI</span>
                        </div>
                        <span className="text-[13px] font-mono font-bold text-cyan-400 pl-3">
                            <CountUp value={stats?.pam_polri || 0} />
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 border-x border-gray-800/30 px-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                            <span className="text-[11px] text-gray-500 font-black tracking-widest uppercase">TNI</span>
                        </div>
                        <span className="text-[13px] font-mono font-bold text-amber-500 pl-3">
                            <CountUp value={stats?.pam_tni || 0} />
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                            <span className="text-[11px] text-gray-500 font-black tracking-widest uppercase">LAINNYA</span>
                        </div>
                        <span className="text-[13px] font-mono font-bold text-purple-400 pl-3">
                            <CountUp value={stats?.pam_lainnya || 0} />
                        </span>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tactical Legend Modal */}
      {showTacticalLegend && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-[30px] transition-opacity"
            onClick={() => setShowTacticalLegend(false)}
          />
          
          <div className="relative w-full max-w-2xl p-8 bg-gray-950/70 backdrop-blur-xl border border-amber-500/20 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)] ews-animate-scale-up my-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <i className="fa-solid fa-circle-info text-sm"></i>
                </div>
                <span className="font-orbitron font-bold text-[16px] text-gray-100 uppercase tracking-[0.2em]">Informasi Status</span>
              </div>
              <button 
                onClick={() => setShowTacticalLegend(false)} 
                className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-500/20 transition-all shadow-lg"
              >
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="text-[13px] text-amber-500 font-black uppercase tracking-[0.2em] mb-4 font-mono flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  Situasi Lapangan
                </div>
                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <div>
                      <div className="text-[14px] text-emerald-400 font-black uppercase mb-1 tracking-wider">AMAN</div>
                      <div className="text-[12px] text-gray-400 font-mono leading-relaxed">Petugas &gt;= Massa atau tidak terdeteksi massa di lapangan.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <div>
                      <div className="text-[14px] text-amber-400 font-black uppercase mb-1 tracking-wider">WASPADA</div>
                      <div className="text-[12px] text-gray-400 font-mono leading-relaxed">Jumlah massa melebihi jumlah petugas (Rasio &lt; 1).</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <div>
                      <div className="text-[14px] text-red-500 font-black uppercase mb-1 tracking-wider">RAWAN</div>
                      <div className="text-[12px] text-gray-400 font-mono leading-relaxed">Jumlah massa melebihi 3x lipat kekuatan petugas.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-[13px] text-amber-500 font-black uppercase tracking-[0.2em] mb-4 font-mono flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  Risiko (3-Hari)
                </div>
                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <div>
                      <div className="text-[14px] text-emerald-400 font-black uppercase mb-1 tracking-wider">RENDAH</div>
                      <div className="text-[12px] text-gray-400 font-mono leading-relaxed">Total kejadian unjuk rasa dalam 72 jam terakhir &lt;= 10 kali.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <div>
                      <div className="text-[14px] text-amber-400 font-black uppercase mb-1 tracking-wider">SEDANG</div>
                      <div className="text-[12px] text-gray-400 font-mono leading-relaxed">Intensitas kejadian 11-30 kali atau volume massa &gt; 5.000.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <div>
                      <div className="text-[14px] text-red-500 font-black uppercase mb-1 tracking-wider">TINGGI</div>
                      <div className="text-[12px] text-gray-400 font-mono leading-relaxed">Intensitas &gt; 30 kali kejadian atau massa masif &gt; 10.000.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-5 border-t border-gray-800 text-[11px] text-gray-500 font-mono uppercase text-center tracking-[0.3em] italic">
              * Parameter dikalkulasi secara otomatis oleh Tactical Analysis Engine
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
