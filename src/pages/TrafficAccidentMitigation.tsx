import React, { useState } from 'react';
import { useTrafficAccidentData } from '../hooks/useTrafficAccidentData';
import { AccidentStats } from '../components/TrafficAccident/AccidentStats';
import { AccidentMap } from '../components/TrafficAccident/AccidentMap';
import { AccidentTable } from '../components/TrafficAccident/AccidentTable';

const TrafficAccidentMitigation: React.FC = () => {
  const { 
    accidents, 
    stats, 
    isLoading, 
    isStatsLoading, 
    province, 
    setProvince,
    injuryStatus,
    setInjuryStatus,
    victimStatus,
    setVictimStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    search,
    setSearch,
    page,
    setPage,
    pagination,
    refresh
  } = useTrafficAccidentData();
  
  const [focusCoord, setFocusCoord] = useState<string | undefined>(undefined);


  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in duration-700">
      {/* Main Statistics HUD */}
      <AccidentStats stats={stats} isLoading={isStatsLoading} />

      {/* Panoramic Tactical Map */}
      <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-cyan-500/5">
        <AccidentMap accidents={accidents} focusCoord={focusCoord} />
      </div>

      {/* Detailed Logs (Full Width with Integrated Controls) */}
      <div className="w-full h-[1000px] overflow-hidden">
        <AccidentTable 
          accidents={accidents} 
          isLoading={isLoading} 
          page={page}
          setPage={setPage}
          pagination={pagination}
          search={search}
          setSearch={setSearch}
          province={province}
          setProvince={setProvince}
          injuryStatus={injuryStatus}
          setInjuryStatus={setInjuryStatus}
          victimStatus={victimStatus}
          setVictimStatus={setVictimStatus}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onViewOnMap={setFocusCoord}
          refresh={refresh}
        />
      </div>

      {/* Deployment Footer Metadata */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/30" />
            Vektor AI Analysis Active
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/30" />
            Polri Integrated Feed
          </div>
        </div>
        <div className="text-[10px] text-gray-700 font-mono tracking-tighter">
          SAKTI_MITIGATION_LANTAS_V1.0.4_REL
        </div>
      </div>
    </div>
  );
};

export default TrafficAccidentMitigation;
