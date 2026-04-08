import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import OSINT from './pages/OSINT';
import Prediktif from './pages/Prediktif';
import CrimeMapping from './pages/CrimeMapping';
import Reskrim from './pages/Reskrim';
import Kolaborasi from './pages/Kolaborasi';
import Integritas from './pages/Integritas';
import Bencana from './pages/Bencana';
import Cuaca from './pages/Cuaca';
import Sembako from './pages/Sembako';
import Mitigasi from './pages/Mitigasi';
import AlertModal from './components/AlertModal';
import ToastContainer from './components/ToastContainer';
import type { Toast, AlertItem } from './types';

export type PageType = 
  | 'dashboard' 
  | 'osint' 
  | 'prediktif' 
  | 'peta' 
  | 'reskrim' 
  | 'kolaborasi' 
  | 'integritas' 
  | 'bencana' 
  | 'cuaca' 
  | 'sembako' 
  | 'mitigasi';

const pageTitles: Record<PageType, string> = {
  dashboard: 'COMMAND CENTER',
  osint: 'SOCIAL SENSING & OSINT',
  prediktif: 'ANALITIK PREDIKTIF',
  peta: 'DYNAMIC CRIME MAPPING',
  reskrim: 'MANAJEMEN INVESTIGASI',
  kolaborasi: 'KOLABORASI SEKTORAL',
  integritas: 'INTEGRITAS & KEAMANAN',
  bencana: 'MITIGASI BENCANA',
  cuaca: 'PREDIKSI CUACA & KLIMATOLOGI',
  sembako: 'PANTAUAN HARGA SEMBAKO',
  mitigasi: 'MITIGASI KEAMANAN WILAYAH'
};

const alertData: AlertItem[] = [
  {
    id: '1',
    icon: '🚗',
    title: 'Kecelakaan Beruntun — Jl. Sudirman',
    description: 'KM 12 arah selatan. 3 kendaraan terlibat. Korban luka. Unit LNT-02 menuju TKP.',
    tags: ['KRITIS', 'LANTAS'],
    time: '14:38',
    priority: 'critical'
  },
  {
    id: '2',
    icon: '⚡',
    title: 'Spike Provokasi Medsos — "Demo"',
    description: '+280% dalam 1 jam. Platform X & Facebook. Lokasi terkait: Alun-alun. Monitoring intensif.',
    tags: ['WASPADA', 'INTELKAM'],
    time: '14:22',
    priority: 'high'
  },
  {
    id: '3',
    icon: '🎯',
    title: 'Recidivism Alert — Rahmat S.',
    description: 'Skor risiko 89. Terdeteksi di Pasar Baru (zona rawan curanmor). Notifikasi Unit-Sabhara terdekat.',
    tags: ['SEDANG', 'AI PREDIKTIF'],
    time: '13:58',
    priority: 'medium'
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto alerts simulation
  useEffect(() => {
    const alerts = [
      { msg: '📡 Data DUKCAPIL disinkronkan — 247 record baru', type: 'info' as const },
      { msg: '⚠️ Keyword "begal" naik +45% di TikTok', type: 'alert' as const },
      { msg: '✅ SKT-03 berhasil melewati titik rawan A7', type: 'success' as const },
      { msg: '📊 Model AI prediktif diperbarui — akurasi 87.3%', type: 'info' as const },
      { msg: '🚨 Laporan 110 baru: Keributan Jl. Diponegoro', type: 'alert' as const },
    ];
    
    let alertIdx = 0;
    const interval = setInterval(() => {
      const a = alerts[alertIdx % alerts.length];
      addToast(a.msg, a.type);
      alertIdx++;
    }, 15000);

    // First toast after 3 seconds
    const initialTimeout = setTimeout(() => {
      addToast('🟢 Sistem SAKTI aktif — Semua modul operasional', 'success');
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard addToast={addToast} />;
      case 'osint':
        return <OSINT addToast={addToast} />;
      case 'prediktif':
        return <Prediktif addToast={addToast} />;
      case 'peta':
        return <CrimeMapping addToast={addToast} />;
      case 'reskrim':
        return <Reskrim addToast={addToast} />;
      case 'kolaborasi':
        return <Kolaborasi addToast={addToast} />;
      case 'integritas':
        return <Integritas addToast={addToast} />;
      case 'bencana':
        return <Bencana addToast={addToast} />;
      case 'cuaca':
        return <Cuaca addToast={addToast} />;
      case 'sembako':
        return <Sembako addToast={addToast} />;
      case 'mitigasi':
        return <Mitigasi addToast={addToast} />;
      default:
        return <Dashboard addToast={addToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 font-rajdhani ews-grid-bg ews-scanline">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />

      {/* Main Content */}
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Topbar */}
        <Topbar 
          title={pageTitles[currentPage]}
          currentTime={currentTime}
          alertCount={3}
          onAlertClick={() => setIsAlertModalOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-5">
          {renderPage()}
        </main>
      </div>

      {/* Alert Modal */}
      <AlertModal 
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        alerts={alertData}
      />

      {/* Toast Container */}
      <ToastContainer 
        toasts={toasts}
        onRemove={removeToast}
      />
    </div>
  );
}

export default App;
