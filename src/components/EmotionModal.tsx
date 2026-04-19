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
  };
}

const EmotionModal = ({ isOpen, onClose, emotions }: EmotionModalProps) => {
  const total = useMemo(() => 
    Object.values(emotions).reduce((a, b) => a + b, 0) || 1
  , [emotions]);

  const emotionList = useMemo(() => [
    { id: 'anger', label: 'Anger / Kemarahan', value: emotions.anger, color: 'bg-red-500', textColor: 'text-red-400', icon: 'fa-face-angry', desc: 'Indikasi narasi yang bersifat konfrontatif atau agresif.' },
    { id: 'fear', label: 'Fear / Ketakutan', value: emotions.fear, color: 'bg-purple-500', textColor: 'text-purple-400', icon: 'fa-face-frown-open', desc: 'Kekhawatiran publik terhadap situasi atau potensi ancaman.' },
    { id: 'sadness', label: 'Sadness / Kesedihan', value: emotions.sadness, color: 'bg-blue-500', textColor: 'text-blue-400', icon: 'fa-face-frown', desc: 'Respon publik yang mencerminkan empati atau kekecewaan.' },
    { id: 'joy', label: 'Joy / Kegembiraan', value: emotions.joy, color: 'bg-emerald-500', textColor: 'text-emerald-400', icon: 'fa-face-smile-beam', desc: 'Apresiasi positif atau dukungan terhadap narasi terkait.' },
    { id: 'surprise', label: 'Surprise / Keterkejutan', value: emotions.surprise, color: 'bg-amber-500', textColor: 'text-amber-400', icon: 'fa-face-surprise', desc: 'Respon terhadap informasi baru atau kejadian yang tidak terduga.' },
  ].sort((a, b) => b.value - a.value), [emotions]);

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Analisis Psikologis"
      subtitle="Breakdown Distribusi Emosi Publik"
      icon="fa-brain"
      footer={
        <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase tracking-widest px-2">
          <span>Metode: NLP Emotional Vectoring</span>
          <span className="text-cyan-500/50">Total Data: {Math.round(total)} Unit</span>
        </div>
      }
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto ews-scrollbar pr-1">
        {emotionList.map((item) => {
          const pct = (item.value / total) * 100;
          return (
            <div key={item.id} className="group/item">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <i className={`fa-solid ${item.icon} ${item.textColor} opacity-70`}></i>
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className={`font-orbitron text-sm font-black ${item.textColor}`}>{pct.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-1.5">
                <div 
                  className={`absolute inset-y-0 left-0 ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center h-4">
                <p className="text-[9px] text-gray-500 italic opacity-0 group-hover/item:opacity-100 transition-opacity">{item.desc}</p>
                <span className="text-[9px] font-mono text-gray-600 uppercase">Volume: {Math.round(item.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </TacticalModal>
  );
};

export default EmotionModal;
