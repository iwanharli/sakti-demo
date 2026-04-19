import { useMemo } from 'react';
import TacticalModal from './CommandCenter/shared/TacticalModal';

interface Keyword {
  keyword: string;
  volume: number;
  neg_count: number;
  pos_count: number;
}

interface NegativeSentimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywords: Keyword[];
  date?: string;
}

const NegativeSentimentModal = ({ isOpen, onClose, keywords, date }: NegativeSentimentModalProps) => {
  const sortedByNeg = useMemo(() => 
    [...keywords]
      .filter(k => k.neg_count > 0)
      .sort((a, b) => {
        const pctA = a.neg_count / (a.volume || 1);
        const pctB = b.neg_count / (b.volume || 1);
        return pctB - pctA;
      })
  , [keywords]);

  const totalNeg = useMemo(() => 
    keywords.reduce((acc, k) => acc + k.neg_count, 0)
  , [keywords]);

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sentimen Negatif"
      subtitle={`EWS Risk Mapping — ${date || 'Active'}`}
      icon="fa-fire-alt"
      width="max-w-xl"
      footer={
        <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase tracking-widest px-2">
          <span>Metode: Sentiment Volatility Index</span>
          <span className="text-red-500/50">Cumulative: {totalNeg} Incidents</span>
        </div>
      }
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto ews-scrollbar pr-1">
        {sortedByNeg.map((item, idx) => {
          const total = item.volume || 1;
          const negPct = (item.neg_count / total) * 100;
          const posPct = (item.pos_count / total) * 100;
          const neutralPct = Math.max(0, 100 - negPct - posPct);

          return (
            <div key={idx} className="group/item">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">{item.keyword}</span>
                </div>
                <div className="text-right">
                  <span className="font-orbitron text-sm font-black text-red-500">{item.neg_count}</span>
                  <span className="text-[10px] text-gray-500 ml-1 font-mono uppercase">Issues</span>
                </div>
              </div>
              
              <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-1.5 flex">
                <div 
                  className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all duration-700"
                  style={{ width: `${negPct}%` }}
                />
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-700"
                  style={{ width: `${neutralPct}%` }}
                />
                <div 
                  className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-700 opacity-20"
                  style={{ width: `${posPct}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center h-4">
                <p className="text-[9px] text-gray-500 italic opacity-0 group-hover/item:opacity-100 transition-opacity">
                  {negPct > 50 ? 'Critical negativity ratio detected.' : 'Monitoring narrative shifts.'}
                </p>
                <div className="flex gap-2 text-[8px] font-mono uppercase">
                   <div className="flex items-center gap-1">
                      <span className="text-red-500 font-bold">{Math.round(negPct)}% RAW NEGATIVITY</span>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </TacticalModal>
  );
};

export default NegativeSentimentModal;
