export const recidivismData = [
  { 
    id: '1', 
    initials: 'RS', 
    name: 'Rahmat S.', 
    description: 'Eks-napi Curanmor · Bebas 2 bln lalu', 
    score: 89, 
    riskLevel: 'high' as const,
    riskHistory: [65, 72, 85, 82, 89] // Last 5 days
  },
  { 
    id: '2', 
    initials: 'BW', 
    name: 'Budi W.', 
    description: 'Eks-napi Begal · Bebas 5 bln lalu', 
    score: 82, 
    riskLevel: 'high' as const,
    riskHistory: [40, 55, 60, 75, 82]
  },
  { 
    id: '3', 
    initials: 'AN', 
    name: 'Ahmad N.', 
    description: 'Eks-napi Narkotika · Bebas 8 bln', 
    score: 61, 
    riskLevel: 'medium' as const,
    riskHistory: [50, 52, 58, 62, 61]
  },
  { 
    id: '4', 
    initials: 'DK', 
    name: 'Dian K.', 
    description: 'Eks-napi Penipuan · Bebas 1 thn', 
    score: 54, 
    riskLevel: 'medium' as const,
    riskHistory: [45, 48, 52, 55, 54]
  },
  { 
    id: '5', 
    initials: 'HP', 
    name: 'Hendra P.', 
    description: 'Eks-napi Curanmor · Bebas 2 thn', 
    score: 22, 
    riskLevel: 'low' as const,
    riskHistory: [30, 28, 25, 23, 22]
  },
];

export const curanmorPredictions = [
  { 
    location: 'Pasar Baru', 
    probability: 78, 
    color: 'red' as const,
    timeVector: [20, 30, 45, 78, 65, 40] // 4h intervals starting 00:00
  },
  { 
    location: 'Terminal', 
    probability: 62, 
    color: 'amber' as const,
    timeVector: [15, 25, 50, 62, 45, 30]
  },
  { 
    location: 'Jl. Merdeka', 
    probability: 55, 
    color: 'amber' as const,
    timeVector: [10, 20, 35, 55, 40, 25]
  },
];

export const begalPredictions = [
  { 
    location: 'Jl. Yos Sudarso', 
    probability: 65, 
    color: 'amber' as const,
    timeVector: [5, 15, 40, 65, 50, 20]
  },
  { 
    location: 'Jl. Gatot Subroto', 
    probability: 48, 
    color: 'amber' as const,
    timeVector: [8, 12, 30, 48, 35, 15]
  },
  { 
    location: 'Kel. Hadimulyo', 
    probability: 32, 
    color: 'cyan' as const,
    timeVector: [12, 18, 25, 32, 28, 15]
  },
];

export const environmentFactors = {
  weather: 'Hujan Lebat (Intensitas 45mm/jam)',
  impact: '+18% Crime Probability in Sector A & B',
  lunarPhase: 'Full Moon (Kecenderungan Agitasi Naik)',
  activeEvents: [
    { title: 'Konser Musik Square', impact: 'Peningkatan Kepadatan Massa' },
    { title: 'Pemadaman Area 7', impact: 'Visibilitas Rendah' }
  ]
};

export const dataSources = [
  { name: 'SPKT', description: '247 laporan · sinkron 5 menit lalu' },
  { name: 'BPS Daerah', description: 'Data sosio-ekonomi · Triwulan IV' },
  { name: 'BMKG', description: 'Cuaca · hujan lebat malam ini' },
  { name: 'STAMAOPS', description: 'EWS aktif · 3 peristiwa terdeteksi' },
];
