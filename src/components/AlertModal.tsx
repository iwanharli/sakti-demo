import type { AlertItem } from '../types';
import TacticalModal from './CommandCenter/shared/TacticalModal';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500 border-red-500/50 text-red-500',
  high: 'bg-amber-500 border-amber-500/50 text-amber-500',
  medium: 'bg-blue-500 border-blue-500/50 text-blue-500',
  low: 'bg-gray-500 border-gray-500/50 text-gray-400'
};

const tagColors: Record<string, string> = {
  'KRITIS': 'bg-red-500/20 text-red-400 border-red-500/30',
  'LANTAS': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'WASPADA': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'INTELKAM': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'SEDANG': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'AI PREDIKTIF': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
};

export default function AlertModal({ isOpen, onClose, alerts }: AlertModalProps) {
  const criticalCount = alerts.filter(a => a.priority === 'critical').length;

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Alert Intelligence"
      subtitle={`Siaga Aktif — ${alerts.length} Insiden Terdeteksi`}
      icon="fa-triangle-exclamation"
      width="max-w-2xl"
      footer={
        <div className="flex justify-between items-center w-full">
           <div className="flex gap-4 text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              <span>Status: Operational</span>
              <span className={criticalCount > 0 ? 'text-red-500' : 'text-emerald-500'}>
                Threat Level: {criticalCount > 0 ? 'Critical' : 'Normal'}
              </span>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-gray-400 font-bold uppercase tracking-wider transition-all"
              >
                Ignored
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-[10px] text-red-500 font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              >
                Acknowledge All
              </button>
           </div>
        </div>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto ews-scrollbar pr-2">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={`group relative flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300`}
          >
            <div className="flex-shrink-0">
               <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-opacity-20 border-opacity-30 border ${priorityColors[alert.priority]}`}>
                  <i className={alert.icon}></i>
               </div>
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start mb-1">
                  <h4 className="font-orbitron font-bold text-white text-sm tracking-wide">{alert.title}</h4>
                  <span className="text-[10px] font-mono text-gray-500">{alert.time}</span>
               </div>
               
               <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">
                 {alert.description}
               </p>
               
               <div className="flex flex-wrap gap-2">
                 {alert.tags.map((tag, idx) => (
                   <span 
                     key={idx} 
                     className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-current ${tagColors[tag] || 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}
                   >
                     {tag}
                   </span>
                 ))}
               </div>
            </div>
            
            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <i className="fa-solid fa-chevron-right text-[10px] text-cyan-500 animate-bounce-x"></i>
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="py-20 text-center opacity-40">
             <i className="fa-solid fa-shield-check text-4xl mb-4 text-emerald-500"></i>
             <p className="font-mono text-[10px] uppercase tracking-widest">No Active Threat Detected</p>
          </div>
        )}
      </div>
    </TacticalModal>
  );
}
