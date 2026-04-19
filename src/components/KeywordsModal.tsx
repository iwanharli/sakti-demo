import { useMemo } from 'react';
import TacticalModal from './CommandCenter/shared/TacticalModal';

interface Keyword {
  keyword: string;
  volume: number;
  pos_count: number;
  neg_count: number;
}

interface KeywordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywords: Keyword[];
  date?: string;
}

const KeywordsModal = ({ isOpen, onClose, keywords, date }: KeywordsModalProps) => {
  const totalVolume = useMemo(() => 
    keywords.reduce((acc, k) => acc + k.volume, 0)
  , [keywords]);

  const sortedKeywords = useMemo(() => 
    [...keywords].sort((a, b) => b.volume - a.volume)
  , [keywords]);

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyword Dipantau"
      subtitle={`EWS Monitoring — ${date || 'Active Sessions'}`}
      icon="fa-bolt-lightning"
      footer={
        <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase tracking-widest px-2">
          <span>Metode: Frequency Analysis</span>
          <span className="text-amber-500/50">Total Keywords: {keywords.length} Unit</span>
        </div>
      }
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto ews-scrollbar pr-1">
        {sortedKeywords.map((item, idx) => {
          const total = item.volume || 1;
          const posPct = (item.pos_count / total) * 100;
          const negPct = (item.neg_count / total) * 100;
          const neutralPct = Math.max(0, 100 - posPct - negPct);
          const volPct = (item.volume / (totalVolume || 1)) * 100;

          return (
            <div key={idx} className="group/item">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-600">#{idx + 1}</span>
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">{item.keyword}</span>
                </div>
                <div className="text-right">
                  <span className="font-orbitron text-sm font-black text-amber-400">{item.volume}</span>
                  <span className="text-[10px] text-gray-500 ml-1 font-mono">POSTS</span>
                </div>
              </div>
              
              <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-1.5 flex">
                <div 
                  className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] transition-all duration-700"
                  style={{ width: `${posPct}%` }}
                />
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] transition-all duration-700"
                  style={{ width: `${neutralPct}%` }}
                />
                <div 
                  className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] transition-all duration-700"
                  style={{ width: `${negPct}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center h-4">
                <p className="text-[9px] text-gray-500 italic opacity-0 group-hover/item:opacity-100 transition-opacity">
                  {volPct > 10 ? 'High relevance detected in active narratives.' : 'Emerging keyword within this period.'}
                </p>
                <div className="flex gap-2 text-[8px] font-mono uppercase">
                  <span className="text-emerald-500">{Math.round(posPct)}% POS</span>
                  <span className="text-blue-500">{Math.round(neutralPct)}% NET</span>
                  <span className="text-red-500">{Math.round(negPct)}% NEG</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </TacticalModal>
  );
};

export default KeywordsModal;
