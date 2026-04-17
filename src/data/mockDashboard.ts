export const JAKARTA_CENTER: [number, number] = [-6.1786045056853, 106.83698404604189];

export const vulnerabilityZones = [
  { pos: [-6.1884, 106.8150], radius: 600, color: '#ef4444' }, // Tanah Abang
  { pos: [-6.173, 106.835], radius: 500, color: '#f59e0b' },   // Senen Area
  { pos: [-6.165, 106.865], radius: 700, color: '#ef4444' },   // Kemayoran/Sunter (New)
];

// Patrol Paths
export const path1: [number, number][] = [
  [-6.171322510246213, 106.82322308890963],
  [-6.180658081561788, 106.82144415477757],
  [-6.1806133070331555, 106.82229984461338],
  [-6.1807028560876205, 106.82320057075555],
  [-6.18043420887679, 106.8323429411036],
  [-6.172777706050539, 106.83002357128589],
  [-6.171053858275997, 106.83333373986034],
  [-6.172374729151485, 106.83412187523567],
  [-6.172956806796989, 106.83400928446895],
  [-6.17472542340964, 106.83265819525371],
  [-6.175486598361914, 106.83263567709963],
  [-6.17600151020973, 106.83252308633286],
  [-6.176471646676831, 106.83117199711762],
  [-6.175106011022521, 106.83065407958617],
  [-6.173471721103425, 106.83018119836095],
  [-6.173180682643974, 106.82941558113976],
  [-6.172800093647595, 106.82912284514373],
  [-6.172285178687375, 106.82919039960422],
  [-6.171613549727397, 106.82930299037298],
  [-6.171501611484629, 106.82896521806867],
  [-6.171456836180667, 106.8237410064412],
  [-6.171322510246213, 106.82322308890963],
];

export const path2: [number, number][] = [
  [-6.184805221301545, 106.81493771691095],
  [-6.185734790824995, 106.81535686045316],
  [-6.186375872302264, 106.81556643222359],
  [-6.189004298230927, 106.81522789320923],
  [-6.192726347996853, 106.81462933211145],
  [-6.1977281214909254, 106.81425511392183],
  [-6.199753619584385, 106.81492039070355],
  [-6.20131679708544, 106.81552464644886],
  [-6.20243288124027, 106.8206251017757],
  [-6.203094263327813, 106.82257935232207],
  [-6.2003936145808325, 106.82311988970645],
  [-6.19573634089015, 106.82303673010904],
  [-6.1953229714156635, 106.82352182776265],
  [-6.196494184084159, 106.82475536179533],
  [-6.195639888041839, 106.82515729985033],
  [-6.194826927620724, 106.82521273958224],
  [-6.194482452488046, 106.82342480823189],
  [-6.194289546315673, 106.82287041091297],
  [-6.190332403196294, 106.82283185603518],
  [-6.187011625303441, 106.8228872957672],
  [-6.184710493114395, 106.82292887556594],
  [-6.183387682052768, 106.82287343583391],
  [-6.181968412338435, 106.8168027852011],
  [-6.184805221301545, 106.81493771691095]
];

export const path3: [number, number][] = [
  [-6.174838551485436, 106.84544344477536],
  [-6.174749288519436, 106.85217723403963],
  [-6.171982129143416, 106.85229694584802],
  [-6.172011883621664, 106.85427219069936],
  [-6.172041638099486, 106.85561894855249],
  [-6.1717738477450155, 106.85696570640431],
  [-6.174183956058144, 106.85765404930737],
  [-6.173588868605478, 106.86019792525099],
  [-6.171268021151391, 106.8651958932831],
  [-6.172755745047482, 106.86597402004139],
  [-6.173440096637833, 106.86573459642358],
  [-6.17456740628478, 106.86456740628478],
  [-6.174749288519436, 106.86414841495258],
  [-6.176237002638857, 106.86423819880906],
  [-6.176415528052885, 106.87297716087653],
  [-6.170196857359059, 106.87414435101539],
  [-6.167548693136695, 106.87321658449434],
  [-6.166269238267432, 106.87585024429455],
  [-6.163680564324977, 106.87683786672028],
  [-6.154932538259942, 106.8621731701025],
  [-6.155378869608825, 106.85843217606703],
  [-6.164870760809251, 106.85223708994442],
  [-6.170524157635654, 106.84625149948806],
  [-6.174838551485436, 106.84544344477536]
];

export const tickerItems = [
  { icon: 'fa-solid fa-circle-dot', text: 'Laporan 110 — Kecelakaan Beruntun Jl. Gajah Mada KM 3 · 14:32', color: 'text-red-400' },
  { icon: 'fa-solid fa-triangle-exclamation', text: 'Spike keywords "demo" +410% · Area Monas & Harmoni', color: 'text-amber-400' },
  { icon: 'fa-solid fa-circle-check', text: 'Patrol Unit SKT-01 sampai di titik rawan Tanah Abang · 14:28', color: 'text-emerald-400' },
  { icon: 'fa-solid fa-circle-info', text: 'Sinkronisasi Data CCTV Jakarta Smart City Berhasil · 1,240 titik aktif', color: 'text-cyan-400' },
];

export const timelineItems = [
  { time: '14:38 WIB', content: 'Kecelakaan beruntun · Jl. Sudirman — Dukuh Atas', tags: ['PRIORITAS TINGGI', 'LANTAS'], color: 'red' as const },
  { time: '14:12 WIB', content: 'Laporan pencopetan · Area Pasar Tanah Abang Blok B', tags: ['SEDANG', 'RESKRIM'], color: 'amber' as const },
  { time: '13:55 WIB', content: 'Konsentrasi massa · Depan Gedung MK (Monas)', tags: ['MONITORING', 'INTELKAM'], color: 'cyan' as const },
  { time: '13:20 WIB', content: 'Patroli rutin Senayan · situasi kondusif', tags: ['SELESAI'], color: 'green' as const },
];

export const patrolStatusUnits = [
  { id: '5123-VII', type: 'Sabhara', location: 'Menteng → Monas', status: 'PATROLI', statusColor: 'green' as const },
  { id: '4152-VII', type: 'Sabhara', location: 'Tanah Abang → HI', status: 'PATROLI', statusColor: 'green' as const },
  { id: 'P-01', type: 'Sabhara', location: 'Kemayoran → Sunter', status: 'PATROLI', statusColor: 'amber' as const },
  { id: 'BBK-12', type: 'Bhabinkamtibmas', location: 'Tanah Abang', status: 'STANDBY', statusColor: 'cyan' as const },
  { id: 'RSK-09', type: 'Reskrim', location: 'Senen — Olah TKP', status: 'BERTUGAS', statusColor: 'amber' as const },
];

export const riskScores = [
  { area: 'TANAH ABANG', score: 89, level: 'KRITIS', color: 'red' as const },
  { area: 'SENEN', score: 72, level: 'WASPADA', color: 'amber' as const },
  { area: 'KOTA TUA', score: 65, level: 'WASPADA', color: 'amber' as const },
  { area: 'SENAYAN', score: 24, level: 'AMAN', color: 'green' as const },
];
