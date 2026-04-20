import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface PageTransitionLoaderProps {
  isVisible: boolean;
  isStandalone?: boolean;
}

export default function PageTransitionLoader({ isVisible, isStandalone = false }: PageTransitionLoaderProps) {
  const [show, setShow] = useState(false);
  const { activeRequests, isSidebarCollapsed } = useAppStore();
  const [loadText, setLoadText] = useState('ACCESSING INTELLIGENCE MATRIX');
  
  const statusTexts = [
    'SYNCHRONIZING SECURE CHANNELS...',
    'BUFFERING INTEL GRID...',
    'DECRYPTING SECTOR DATA...',
    'INITIALIZING TACTICAL OVERLAY...',
    'RE-LINKING NEURAL NETWORKS...'
  ];

  // No longer need to sync a single loadText for network logs
  // as we will map directly over activeRequests in the JSX.

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const interval = setInterval(() => {
        setLoadText(statusTexts[Math.floor(Math.random() * statusTexts.length)]);
      }, 200);
      return () => clearInterval(interval);
    } else {
      const timer = setTimeout(() => setShow(false), 500); // Match fade-out duration
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className={`
      fixed z-[1050] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden 
      ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      ${isStandalone ? 'inset-0' : `${isSidebarCollapsed ? 'left-20' : 'left-72'} top-[64px] right-0 bottom-0`}
    `}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#070a12]/90 backdrop-blur-3xl ews-scanline" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-red-500/5 opacity-40" />
      
      {/* Central Tactical Element */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glowing SAKTI Logo Construct */}
        <div className="relative mb-12">
            <div className="w-24 h-24 rounded-full border-2 border-cyan-500/20 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-0 w-24 h-24 rounded-full border-t-2 border-cyan-500 animate-[spin_2s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
                {/* IDENTICAL SIDEBAR LOGO FOR LOADER */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 border border-white/40 rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-pulse">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
                    <i className="fa-solid fa-shield-halved absolute text-4xl text-white/20 scale-110"></i>
                    <span className="relative font-orbitron font-black text-3xl text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.8)] z-10 leading-none">S</span>
                    {/* Continuous Sweep for Loader */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-[ews-ticker_2s_linear_infinite]" />
                </div>
            </div>
            
            {/* Pulsing Outer Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-cyan-500/10 rounded-full animate-ping" />
        </div>

        {/* Text Area */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-cyan-500" />
            <span className="font-orbitron text-[15px] font-black text-white uppercase tracking-[0.4em] animate-pulse">
                SAKTI <span className="text-cyan-500">SYSTEMS</span>
            </span>
            <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-cyan-500" />
          </div>
          
          {/* Elegant Minimalist Progress Bar */}
          <div className="h-[2px] w-72 bg-white/5 rounded-full overflow-hidden relative mx-auto">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-[ews-ticker_2s_ease-in-out_infinite]" />
          </div>

          {/* Static-Height Log Container to Prevent Logo Jumping */}
          <div className="flex flex-col items-start gap-1.5 h-[80px] mt-4 w-72 mx-auto overflow-hidden">
            {activeRequests.length > 0 ? (
                /* Show the last 3 requests as a rolling log */
                activeRequests.slice(-3).map((req, idx) => {
                    const isRetrying = req.includes('RETRYING');
                    const isError = req.includes('ERROR');
                    
                    return (
                        <div 
                            key={`${req}-${idx}`} 
                            className={`flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-1 duration-300 w-full
                                ${isError ? 'text-red-500' : isRetrying ? 'text-amber-400' : 'text-cyan-500/70'}`}
                        >
                            <i className={`fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-satellite-dish'} text-[8px] ${!isError ? 'animate-pulse' : ''} flex-shrink-0`}></i>
                            <span className="truncate">{req.split(' [')[0]}</span>
                            <span className={`text-[8px] opacity-60 ml-auto flex-shrink-0 font-bold`}>
                                {isError ? '... ERR' : isRetrying ? req.match(/\[(.*?)\]/)?.[1] || '... RETRY' : '... OK'}
                            </span>
                        </div>
                    );
                })
            ) : (
                /* Fallback professional log centered in the fixed space */
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-[10px] text-cyan-500/40 font-mono font-black uppercase tracking-[0.5em] animate-pulse">
                        {loadText}
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative HUD Details */}
      <div className="absolute top-10 left-10 text-[9px] text-gray-600 font-mono uppercase tracking-[0.2em] space-y-1 opacity-40">
        <div>System_Kernel: v.4.0.1_RND</div>
        <div>Loading_Module: SEC_TRANSIT</div>
        <div>Auth_Token: VERIFIED</div>
      </div>
      
      <div className="absolute bottom-10 right-10 text-[9px] text-gray-600 font-mono uppercase tracking-[0.2em] space-y-1 opacity-40 text-right">
        <div>Lat: -6.2088 | Lon: 106.8456</div>
        <div>Packet_Loss: 0.00%</div>
        <div>Signal: CRYPTO_PRIME</div>
      </div>
    </div>
  );
}
