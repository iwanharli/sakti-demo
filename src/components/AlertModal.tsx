import type { AlertItem } from '../types';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
}

const priorityClasses = {
  critical: 'ews-alert-critical',
  high: 'ews-alert-high',
  medium: 'ews-alert-medium',
  low: 'ews-alert-low'
};

const tagColors: Record<string, string> = {
  'KRITIS': 'ews-tag-red',
  'LANTAS': 'ews-tag-amber',
  'WASPADA': 'ews-tag-amber',
  'INTELKAM': 'ews-tag-purple',
  'SEDANG': 'ews-tag-amber',
  'AI PREDIKTIF': 'ews-tag-cyan'
};

export default function AlertModal({ isOpen, onClose, alerts }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="ews-modal-overlay" onClick={onClose}>
      <div className="ews-modal max-w-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-orbitron font-bold text-lg text-red-400 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i> SIAGA AKTIF — {alerts.length} INSIDEN
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`flex gap-3 p-4 rounded-lg ${priorityClasses[alert.priority]}`}
            >
              <div className="text-2xl flex-shrink-0 text-white/80">
                <i className={alert.icon}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm mb-1">{alert.title}</h4>
                <p className="text-xs text-gray-400 mb-2 leading-relaxed">{alert.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {alert.tags.map((tag, idx) => (
                    <span key={idx} className={`ews-tag ${tagColors[tag] || 'ews-tag-cyan'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-500 font-mono flex-shrink-0">{alert.time}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-800">
          <button 
            onClick={onClose}
            className="ews-btn ews-btn-red"
          >
            Tandai Selesai
          </button>
          <button 
            onClick={onClose}
            className="ews-btn ews-btn-cyan"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
