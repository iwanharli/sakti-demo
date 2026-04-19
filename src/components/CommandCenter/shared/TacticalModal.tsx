import React, { useEffect } from 'react';

interface TacticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

const TacticalModal: React.FC<TacticalModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon = 'fa-brain',
  children,
  footer,
  width = 'max-w-xl'
}) => {
  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      <div className={`relative w-full ${width} bg-[#0b1419] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up`}>
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-cyan-500/5 to-transparent">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <i className={`fa-solid ${icon} text-xl`}></i>
                </div>
              )}
              <div>
                <h3 className="font-orbitron font-bold text-lg text-white tracking-wide">{title}</h3>
                {subtitle && <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{subtitle}</p>}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition-all hover:text-white group"
            >
              <i className="fa-solid fa-xmark group-hover:rotate-90 transition-transform"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10 transition-all">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 bg-black/40 border-t border-white/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalModal;
