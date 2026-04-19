import React from 'react';

const UnderDevelopment: React.FC = () => {
  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#080b14] border border-white/5 shadow-2xl">
      {/* Background Effects */}
      <div className="absolute inset-0 ews-scanline opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
      
      {/* HUD Frame Details */}
      <div className="absolute top-8 left-8 flex flex-col gap-1 opacity-40">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-500 rounded-sm animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-500 font-black tracking-[0.3em]">SECURE_LINK: ACTIVE</span>
        </div>
        <div className="text-[8px] font-mono text-gray-600 uppercase tracking-widest pl-4">MOD_PRED_V4.0.2</div>
      </div>

      <div className="absolute top-8 right-8 text-right opacity-40">
        <div className="text-[10px] font-mono text-gray-500 font-black tracking-[0.2em] uppercase">SYSTEM_TIME</div>
        <div className="text-[12px] font-orbitron text-white">{new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
      </div>

      {/* Decorative Corner Brackets */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t border-l border-white/10 rounded-tl-2xl" />
      <div className="absolute top-6 right-6 w-16 h-16 border-t border-r border-white/10 rounded-tr-2xl" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b border-l border-white/10 rounded-bl-2xl" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b border-r border-white/10 rounded-br-2xl" />

      {/* Main Container for alignment */}
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-2xl w-full px-12">
        
        {/* Central Hologram Area */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Pulsing Core */}
          <div className="relative z-20 w-32 h-32 rounded-3xl bg-black/60 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.1)] backdrop-blur-md animate-pulse">
             <i className="fa-solid fa-microchip text-5xl text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]"></i>
             
             {/* Tiny Scanning Line */}
             <div className="absolute inset-2 border-t border-cyan-500/50 animate-[ews-scan_3s_linear_infinite] opacity-50" />
          </div>

          {/* Orbital Rings with varied speeds */}
          <div className="absolute inset-0 border border-dashed border-cyan-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-4 border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite_reverse]">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
          </div>
          <div className="absolute inset-12 border border-white/5 rounded-full animate-[spin_30s_linear_infinite]" />
          
          {/* Floating Markers */}
          <div className="absolute top-0 right-0 p-2 opacity-30 animate-bounce">
             <i className="fa-solid fa-shield-halved text-amber-500 text-lg"></i>
          </div>
          <div className="absolute bottom-4 left-0 p-2 opacity-30 animate-bounce [animation-delay:0.5s]">
             <i className="fa-solid fa-code text-cyan-400 text-lg"></i>
          </div>
        </div>

        {/* Content Section */}
        <div className="text-center space-y-8 w-full">
          <div className="space-y-4">
             <div className="flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <span className="text-[12px] font-mono font-black text-cyan-500 uppercase tracking-[0.6em]">STATUS: PENGEMBANGAN</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-500/30 to-transparent" />
             </div>
             
             <div>
                <h1 className="text-7xl font-orbitron font-black text-white tracking-[-0.05em] leading-none mb-2">
                    UNDER <span className="text-cyan-500 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]">DEVELOPMENT</span>
                </h1>
                <p className="text-gray-500 font-rajdhani text-xl font-bold tracking-[0.2em] uppercase italic opacity-70">
                    Sistem Peringatan Dini
                </p>
             </div>
          </div>

          {/* Integration Status Card - Ultra Minimalist */}
          <div className="relative group/card max-w-xs mx-auto w-full">
             <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur opacity-20 group-hover/card:opacity-30 transition duration-1000" />
             <div className="relative bg-black/60 border border-white/5 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl">
                <div className="text-center">
                    <div className="text-[9px] text-gray-600 uppercase font-black mb-1 tracking-widest">PROTOKOL ANALITIK</div>
                    <div className="text-[13px] text-white font-mono font-bold tracking-tight">SAKTI_PROXIMO_V4</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Extreme Bottom Corner HUD Details */}
      <div className="absolute bottom-8 left-8 text-[9px] text-gray-700 font-mono uppercase tracking-[0.2em] space-y-1 opacity-50">
        <div>Lat: -6.2088 | Lon: 106.8456</div>
        <div>Sector: DELTA_BOGOR</div>
      </div>
      <div className="absolute bottom-8 right-8 text-[9px] text-red-900/40 font-mono uppercase tracking-[0.5em] italic">
        ACCESSING RESTRICTED_AREA
      </div>
    </div>
  );
};

export default UnderDevelopment;
