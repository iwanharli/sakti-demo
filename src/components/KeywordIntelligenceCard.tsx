import React, { useMemo } from 'react';
import CardDateRangePicker from './CommandCenter/shared/CardDateRangePicker';

interface KeywordData {
  keyword: string;
  volume: number;
  pos_count: number;
  neg_count: number;
  neut_count: number;
  platforms: string[];
  spike: number;
}

interface KeywordIntelligenceCardProps {
  keywords: KeywordData[];
  range: { start: string; end: string };
  setRange: (range: any) => void;
  hideFilters?: boolean;
}

const platformIcons: Record<string, { icon: string; color: string }> = {
  'twitter': { icon: 'fa-brands fa-x-twitter', color: 'text-white' },
  'instagram': { icon: 'fa-brands fa-instagram', color: 'text-[#E4405F]' },
  'tiktok': { icon: 'fa-brands fa-tiktok', color: 'text-white' },
  'facebook': { icon: 'fa-brands fa-facebook', color: 'text-[#1877F2]' },
  'youtube': { icon: 'fa-brands fa-youtube', color: 'text-[#FF0000]' },
  'news': { icon: 'fa-solid fa-newspaper', color: 'text-emerald-400' }
};

const KeywordIntelligenceCard: React.FC<KeywordIntelligenceCardProps> = ({ keywords, range, setRange, hideFilters = false }) => {
  const maxVolume = useMemo(() => Math.max(...(keywords || []).map(k => k.volume), 1), [keywords]);

  const getDominantSentiment = (pos: number, neg: number, neut: number) => {
    const max = Math.max(pos, neg, neut);
    if (max === 0) return { label: 'TIDAK ADA DATA', class: 'bg-gray-500/5 text-gray-500 border-white/5' };
    
    if (max === neg) return { label: 'NEGATIF', class: 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' };
    if (max === neut) return { label: 'NETRAL', class: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    return { label: 'POSITIF', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' };
  };

  return (
    <div className="ews-card p-6 relative overflow-hidden group/intel mb-6">
      <div className="ews-card-header-bar" />
      
      {/* Header Side Effects */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)] relative">
            <i className="fa-solid fa-tower-broadcast text-xl animate-pulse"></i>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg text-white tracking-wider flex items-center gap-2">
              KATA KUNCI TERPANTAU
            </h3>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              MONITORING • DETEKSI ANOMALI
            </p>
          </div>
        </div>
        
        {!hideFilters && (
          <div className="flex items-center gap-4">
            <CardDateRangePicker 
              start={range.start} 
              end={range.end} 
              setRange={setRange} 
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto ews-scrollbar">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">
              <th className="text-left pb-4 pl-4 font-orbitron">Kata Kunci</th>
              <th className="text-center pb-4 font-orbitron">Platform</th>
              <th className="text-left pb-4 font-orbitron">Volume (1J)</th>
              <th className="text-center pb-4 font-orbitron">Lonjakan</th>
              <th className="text-center pb-4 pr-4 font-orbitron">Sentimen Dominan</th>
            </tr>
          </thead>
          <tbody>
            {keywords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-30">
                    <i className="fa-solid fa-database text-4xl mb-2"></i>
                    <span className="font-orbitron text-[10px] tracking-[0.3em] uppercase">Tidak Ada Data Intelijen Ditemukan</span>
                    <span className="text-[9px] font-mono">PILIH RENTANG TANGGAL LAIN UNTUK ANALISIS</span>
                  </div>
                </td>
              </tr>
            ) : (
              keywords.map((kw, idx) => {
                const sentiment = getDominantSentiment(kw.pos_count, kw.neg_count, kw.neut_count);
                const volPct = (kw.volume / maxVolume) * 100;
                
                return (
                  <tr key={idx} className="bg-white/[0.02] hover:bg-white/[0.04] transition-all group/row border border-white/5">
                    <td className="py-4 pl-4 rounded-l-xl border-l border-y border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-4 rounded-full ${kw.spike > 200 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-amber-500'}`} />
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-200 text-[13px] tracking-wide">{kw.keyword}</span>
                          {kw.spike > 200 && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 text-[8px] font-black font-mono border border-red-500/30">CRITICAL</span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 text-center border-y border-white/5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex -space-x-1">
                          {kw.platforms?.slice(0, 5).map((plt, pIdx) => {
                            const config = platformIcons[plt.toLowerCase()] || platformIcons['news'];
                            return (
                              <div key={pIdx} className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-[11px] backdrop-blur-sm shadow-xl hover:translate-y-[-2px] hover:border-cyan-500/50 transition-all cursor-crosshair">
                                <i className={`${config.icon} ${config.color}`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 border-y border-white/5">
                      <div className="w-32">
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-sm font-black font-orbitron text-white">{kw.volume.toLocaleString()}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all duration-1000" 
                            style={{ width: `${volPct}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 text-center border-y border-white/5">
                      <div className="flex items-center justify-center gap-1.5 text-amber-500">
                        <i className="fa-solid fa-arrow-trend-up text-[10px]"></i>
                        <span className="text-xs font-black font-orbitron tracking-tighter">+{kw.spike}%</span>
                      </div>
                    </td>
                    
                    <td className="py-4 pr-4 text-center rounded-r-xl border-r border-y border-white/5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black tracking-widest ${sentiment.class}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {sentiment.label}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KeywordIntelligenceCard;
