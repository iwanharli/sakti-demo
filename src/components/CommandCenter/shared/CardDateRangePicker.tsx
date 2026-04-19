import React from 'react';

interface CardDateRangePickerProps {
  start: string;
  end: string;
  setRange: (range: any) => void;
}

const CardDateRangePicker: React.FC<CardDateRangePickerProps> = ({ start, end, setRange }) => {
  return (
    <div className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 hover:border-cyan-500/50 transition-all group">
      <div className="flex items-center gap-2">
        <i className="fa-solid fa-calendar-alt text-cyan-400 text-[10px] group-hover:drop-shadow-[0_0_5px_#22d3ee] transition-all" />
        <input 
          type="date" 
          value={start}
          onChange={(e) => setRange((r: any) => ({ ...r, start: e.target.value }))}
          className="bg-transparent text-[10px] text-gray-300 font-mono focus:outline-none [color-scheme:dark] cursor-pointer"
        />
      </div>
      <div className="text-gray-600 text-[10px] font-bold">—</div>
      <div className="flex items-center gap-2">
        <input 
          type="date" 
          value={end}
          onChange={(e) => setRange((r: any) => ({ ...r, end: e.target.value }))}
          className="bg-transparent text-[10px] text-gray-300 font-mono focus:outline-none [color-scheme:dark] cursor-pointer"
        />
      </div>
    </div>
  );
};

export default CardDateRangePicker;
