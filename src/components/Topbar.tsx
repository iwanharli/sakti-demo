interface TopbarProps {
  title: string;
  currentTime: Date;
  alertCount: number;
  onAlertClick: () => void;
}

export default function Topbar({ title, currentTime, alertCount, onAlertClick }: TopbarProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1a]/95 backdrop-blur-xl border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Title & Breadcrumb */}
        <div>
          <h2 className="font-orbitron font-bold text-base text-white tracking-wider">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">SAKTI › Dashboard Utama</p>
        </div>

        {/* Right: Time, Alert, User */}
        <div className="flex items-center gap-5">
          {/* Live Clock */}
          <div className="font-mono text-cyan-400 text-sm tracking-wider">
            {formatTime(currentTime)} WIB
          </div>

          {/* Alert Button */}
          <button
            onClick={onAlertClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/15 border border-red-500/40 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors ews-animate-pulse-red"
          >
            <span>🚨</span>
            <span>{alertCount} SIAGA AKTIF</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-800 to-blue-600 border-2 border-cyan-500 flex items-center justify-center">
              <span className="text-xs font-bold text-cyan-400">AK</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-white">AKBP Ahmad K.</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">KAPOLRES</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
