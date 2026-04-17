export const recidivismData = [
  { id: '1', initials: 'RS', name: 'Rahmat S.', description: 'Eks-napi Curanmor · Bebas 2 bln lalu', score: 89, riskLevel: 'high' as const },
  { id: '2', initials: 'BW', name: 'Budi W.', description: 'Eks-napi Begal · Bebas 5 bln lalu', score: 82, riskLevel: 'high' as const },
  { id: '3', initials: 'AN', name: 'Ahmad N.', description: 'Eks-napi Narkotika · Bebas 8 bln', score: 61, riskLevel: 'medium' as const },
  { id: '4', initials: 'DK', name: 'Dian K.', description: 'Eks-napi Penipuan · Bebas 1 thn', score: 54, riskLevel: 'medium' as const },
  { id: '5', initials: 'HP', name: 'Hendra P.', description: 'Eks-napi Curanmor · Bebas 2 thn', score: 22, riskLevel: 'low' as const },
];

export const curanmorPredictions = [
  { location: 'Pasar Baru', probability: 78, color: 'red' as const },
  { location: 'Terminal', probability: 62, color: 'amber' as const },
  { location: 'Jl. Merdeka', probability: 55, color: 'amber' as const },
];

export const begalPredictions = [
  { location: 'Jl. Yos Sudarso', probability: 65, color: 'amber' as const },
  { location: 'Jl. Gatot Subroto', probability: 48, color: 'amber' as const },
  { location: 'Kel. Hadimulyo', probability: 32, color: 'cyan' as const },
];

export const dataSources = [
  { name: 'SPKT', description: '247 laporan · sinkron 5 menit lalu' },
  { name: 'BPS Daerah', description: 'Data sosio-ekonomi · Triwulan IV' },
  { name: 'BMKG', description: 'Cuaca · hujan lebat malam ini' },
  { name: 'STAMAOPS', description: 'EWS aktif · 3 peristiwa terdeteksi' },
];
