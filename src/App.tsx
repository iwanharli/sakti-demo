import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Osint from './pages/Osint';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
// import CrimeMapping from './pages/CrimeMapping';
// import InvestigationManagement from './pages/InvestigationManagement';
// import SectoralCollaboration from './pages/SectoralCollaboration';
import SecurityIntegrity from './pages/SecurityIntegrity';
import DisasterMitigation from './pages/DisasterMitigation';
import WeatherForecast from './pages/WeatherForecast';
import CommoditiesPrice from './pages/CommoditiesPrice';
import SecurityMitigation from './pages/SecurityMitigation';
import Login from './pages/Login';
import AlertModal from './components/AlertModal';
import Swal from 'sweetalert2';
import type { Toast, AlertItem } from './types';

export type PageType = 
  | 'login'
  | 'dashboard' 
  | 'osint' 
  | 'predictive-analytics' 
  // | 'crime-mapping' 
  // | 'investigation-management' 
  // | 'sectoral-collaboration' 
  | 'security-integrity' 
  | 'disaster-mitigation' 
  | 'weather-forecast' 
  | 'commodities-price' 
  | 'security-mitigation';

const pageTitles: Record<PageType, string> = {
  login: 'AUTENTIKASI SISTEM',
  dashboard: 'COMMAND CENTER',
  osint: 'OSINT',
  'predictive-analytics': 'ANALITIK PREDIKTIF',
  // 'crime-mapping': 'DYNAMIC CRIME MAPPING',
  // 'investigation-management': 'MANAJEMEN INVESTIGASI',
  // 'sectoral-collaboration': 'KOLABORASI SEKTORAL',
  'security-integrity': 'INTEGRITAS & KEAMANAN',
  'disaster-mitigation': 'MITIGASI BENCANA',
  'weather-forecast': 'PREDIKSI CUACA',
  'commodities-price': 'HARGA SEMBAKO',
  'security-mitigation': 'MITIGASI KEAMANAN'
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
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- NATIVE HASH ROUTING LOGIC ---
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') as PageType;
      
      // Validation & Guard
      const isValidPage = pageTitles[hash] !== undefined;
      const isAuthenticated = sessionStorage.getItem('sakti_auth') === 'true';

      if (!isValidPage) {
        window.location.hash = isAuthenticated ? '#/dashboard' : '#/login';
        return;
      }

      // Force login if not authenticated
      if (hash !== 'login' && !isAuthenticated) {
        window.location.hash = '#/login';
        return;
      }

      setCurrentPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Initial call
    if (!window.location.hash) {
      window.location.hash = '#/login';
    } else {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto alerts simulation
  useEffect(() => {
    if (currentPage === 'login') return;

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

    return () => clearInterval(interval);
  }, [currentPage]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
      background: '#05080f',
      color: '#ffffff',
      customClass: {
        popup: 'border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-rajdhani',
      }
    });

    let swalIcon: 'info' | 'warning' | 'success' | 'error' = 'info';
    if (type === 'alert') swalIcon = 'warning';
    if (type === 'success') swalIcon = 'success';

    Toast.fire({
      icon: swalIcon,
      title: message
    });
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLoginSuccess={() => window.location.hash = '#/dashboard'} addToast={addToast} />;
      case 'dashboard': return <Dashboard addToast={addToast} />;
      case 'osint': return <Osint addToast={addToast} />;
      case 'predictive-analytics': return <PredictiveAnalytics addToast={addToast} />;
      // case 'crime-mapping': return <CrimeMapping addToast={addToast} />;
      // case 'investigation-management': return <InvestigationManagement addToast={addToast} />;
      // case 'sectoral-collaboration': return <SectoralCollaboration addToast={addToast} />;
      case 'security-integrity': return <SecurityIntegrity addToast={addToast} />;
      case 'disaster-mitigation': return <DisasterMitigation addToast={addToast} />;
      case 'weather-forecast': return <WeatherForecast addToast={addToast} />;
      case 'commodities-price': return <CommoditiesPrice addToast={addToast} />;
      case 'security-mitigation': return <SecurityMitigation addToast={addToast} />;
      default: return <Dashboard addToast={addToast} />;
    }
  };

  const isLoginPage = currentPage === 'login';

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 font-rajdhani ews-grid-bg ews-scanline">
      {!isLoginPage && (
        <Sidebar currentPage={currentPage} />
      )}

      <div className={`${isLoginPage ? '' : 'ml-72'} min-h-screen flex flex-col`}>
        {!isLoginPage && (
          <Topbar 
            title={pageTitles[currentPage]}
            currentTime={currentTime}
            alertCount={3}
            onAlertClick={() => setIsAlertModalOpen(true)}
          />
        )}

        <main className={`${isLoginPage ? 'p-0' : 'flex-1 p-5'}`}>
          {renderPage()}
        </main>
      </div>

      {!isLoginPage && (
        <AlertModal 
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          alerts={alertData}
        />
      )}
    </div>
  );
}

export default App;
