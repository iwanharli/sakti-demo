import React from 'react';
import HUDDecorations from './HUDDecorations';

interface TacticalCardProps {
  children: React.ReactNode;
  className?: string;
  headerIcon?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  headerSubtitleColor?: string;
  headerExtra?: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

const TacticalCard: React.FC<TacticalCardProps> = ({ 
  children, 
  className = '', 
  headerIcon, 
  headerTitle, 
  headerSubtitle,
  headerSubtitleColor = 'text-cyan-500/60',
  headerExtra,
  iconBgColor = 'bg-cyan-500/10',
  iconColor = 'text-cyan-400'
}) => {
  return (
    <div className={`ews-card p-6 relative group/card ${className}`}>
      <HUDDecorations />
      
      {(headerTitle || headerIcon) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {headerIcon && (
              <div className={`w-10 h-10 rounded ${iconBgColor} border border-white/10 flex items-center justify-center ${iconColor} shadow-[0_0_15px_rgba(6,182,212,0.1)]`}>
                <i className={`${headerIcon} text-lg`}></i>
              </div>
            )}
            <div>
              {headerTitle && (
                <span className="font-orbitron font-bold text-[15px] text-gray-100 uppercase tracking-wider block">
                  {headerTitle}
                </span>
              )}
              {headerSubtitle && (
                <span className={`text-[10px] ${headerSubtitleColor} font-mono uppercase tracking-[0.2em] flex items-center gap-2`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${headerSubtitleColor.replace('text-', 'bg-').split('/')[0]} animate-pulse`} />
                  {headerSubtitle}
                </span>
              )}
            </div>
          </div>
          {headerExtra}
        </div>
      )}
      
      {children}
    </div>
  );
};

export default TacticalCard;
