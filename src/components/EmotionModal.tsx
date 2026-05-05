import { useMemo } from 'react';
import TacticalModal from './CommandCenter/shared/TacticalModal';

interface EmotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  emotions: {
    anger: number;
    fear: number;
    sadness: number;
    joy: number;
    surprise: number;
    provocative: number;
    panic: number;
    neutral: number;
  };
}

const EmotionModal = ({ isOpen, onClose, emotions }: EmotionModalProps) => {
  const total = useMemo(() => 
    Object.values(emotions || {}).reduce((a, b) => a + (b || 0), 0) || 1
  , [emotions]);

  const emotionList = useMemo(() => [
    { id: 'anger', label: 'Anger / Kemarahan', value: emotions?.anger || 0, color: 'bg-red-500', textColor: 'text-red-400', icon: 'fa-fire', desc: 'Indikasi narasi yang bersifat konfrontatif atau agresif.' },
    { id: 'fear', label: 'Fear / Ketakutan', value: emotions?.fear || 0, color: 'bg-purple-500', textColor: 'text-purple-400', icon: 'fa-ghost', desc: 'Kekhawatiran publik terhadap situasi atau potensi ancaman.' },
    { id: 'sadness', label: 'Sadness / Kesedihan', value: emotions?.sadness || 0, color: 'bg-blue-500', textColor: 'text-blue-400', icon: 'fa-cloud-rain', desc: 'Respon publik yang mencerminkan empati atau kekecewaan.' },
    { id: 'joy', label: 'Joy / Kegembiraan', value: emotions?.joy || 0, color: 'bg-yellow-500', textColor: 'text-yellow-400', icon: 'fa-sun', desc: 'Apresiasi positif atau dukungan terhadap narasi terkait.' },
    { id: 'surprise', label: 'Surprise / Keterkejutan', value: emotions?.surprise || 0, color: 'bg-cyan-500', textColor: 'text-cyan-400', icon: 'fa-bolt', desc: 'Respon terhadap informasi baru atau kejadian yang tidak terduga.' },
    { id: 'provocative', label: 'Provocative / Provokasi', value: emotions?.provocative || 0, color: 'bg-orange-500', textColor: 'text-orange-400', icon: 'fa-hand-fist', desc: 'Konten yang bertujuan memicu reaksi keras atau perpecahan.' },
    { id: 'panic', label: 'Panic / Kepanikan', value: emotions?.panic || 0, color: 'bg-amber-500', textColor: 'text-amber-400', icon: 'fa-triangle-exclamation', desc: 'Respon mendesak yang mencerminkan hilangnya ketenangan publik.' },
    { id: 'neutral', label: 'Neutral / Netral', value: emotions?.neutral || 0, color: 'bg-gray-500', textColor: 'text-gray-400', icon: 'fa-face-meh', desc: 'Informasi atau respon yang bersifat faktual dan objektif.' },
  ].sort((a, b) => b.value - a.value), [emotions]);

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Analisis Emosi & Psikologi"
      subtitle="Pecahan Distribusi Suasana Hati Publik"
      icon="fa-brain"
      footer={
        <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase tracking-widest px-2">
          <span>Metode: OSINT AI Emotional Vectoring</span>
          <span className="text-cyan-500/50">Total Sampel: {Math.round(total).toLocaleString()} Post</span>
        </div>
      }
    >
      <div className="space-y-6 max-h-[65vh] overflow-y-auto ews-scrollbar pr-2">
        {emotionList.map((item) => {
          const pct = (item.value / total) * 100;
          return (
            <div key={item.id} className="group/item">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center ${item.textColor} shadow-lg group-hover/item:scale-110 transition-transform`}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-gray-200 uppercase tracking-wider block">{item.label}</span>
                    <p className="text-[9px] text-gray-500 italic max-w-[280px] line-clamp-1">{item.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-orbitron text-sm font-black ${item.textColor}`}>{pct.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-1.5 border border-white/5">
                <div 
                  className={`absolute inset-y-0 left-0 ${item.color} shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-1000`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${i < pct / 10 ? item.color : 'bg-white/10'}`} />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-gray-600 uppercase">Vol: {Math.round(item.value).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </TacticalModal>
  );
};

export default EmotionModal;
