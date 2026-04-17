import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Osint from './pages/Osint';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import CrimeMapping from './pages/CrimeMapping';
import InvestigationManagement from './pages/InvestigationManagement';
import SectoralCollaboration from './pages/SectoralCollaboration';
import SecurityIntegrity from './pages/SecurityIntegrity';
import DisasterMitigation from './pages/DisasterMitigation';
import WeatherForecast from './pages/WeatherForecast';
import CommoditiesPrice from './pages/CommoditiesPrice';
import SecurityMitigation from './pages/SecurityMitigation';
import ApiDocs from './pages/ApiDocs';
import Login from './pages/Login';
import AlertModal from './components/AlertModal';
import { useAppStore } from './store/useAppStore';
import type { AlertItem } from './types';

export type PageType = 
  | 'login'
  | 'dashboard' 
  | 'osint' 
  | 'predictive-analytics' 
  | 'crime-mapping' 
  | 'investigation-management' 
  | 'security-integrity' 
  | 'disaster-mitigation' 
  | 'weather-forecast' 
  | 'commodities-price' 
  | 'security-mitigation'
  | 'api-docs';

const pageTitles: Record<PageType, string> = {
  login: 'AUTENTIKASI SISTEM',
  dashboard: 'COMMAND CENTER',
  osint: 'OSINT',
  'predictive-analytics': 'ANALITIK PREDIKTIF',
  'crime-mapping': 'DYNAMIC CRIME MAPPING',
  'investigation-management': 'MANAJEMEN INVESTIGASI',
  'security-integrity': 'INTEGRITAS & KEAMANAN',
  'disaster-mitigation': 'MITIGASI BENCANA',
  'weather-forecast': 'PREDIKSI CUACA',
  'commodities-price': 'HARGA SEMBAKO',
  'security-mitigation': 'MITIGASI KEAMANAN',
  'api-docs': 'API DOCUMENTATION'
};

const pageSubtitles: Record<PageType, string> = {
  login: 'Otoritas Akses Sistem SAKTI',
  dashboard: 'Pusat Kendali Operasional Terintegrasi',
  osint: 'Intelegensi Media Sosial & Analisis Sinyal',
  'predictive-analytics': 'Sistem Peringatan Dini Berbasis Vektor AI',
  'crime-mapping': 'Visualisasi Spasial Kepadatan Kriminalitas',
  'investigation-management': 'Administrasi Perkara & Penelusuran Investigasi',
  'security-integrity': 'Integritas Sistem & Audit Keamanan',
  'disaster-mitigation': 'Monitoring Bencana & Manajemen Kedaruratan',
  'weather-forecast': 'Analisis Cuaca & Prediksi Atmosferik',
  'commodities-price': 'Pemantauan Harga Pangan & Inflasi',
  'security-mitigation': 'Strategi Pencegahan & Mitigasi Kejahatan',
  'api-docs': 'Referensi Teknis & Dokumentasi Endpoint SAKTI'
};

const alertData: AlertItem[] = [
  {
    id: '1',
    icon: 'fa-solid fa-car-burst',
    title: 'Kecelakaan Beruntun — Jl. Sudirman',
    description: 'KM 12 arah selatan. 3 kendaraan terlibat. Korban luka. Unit LNT-02 menuju TKP.',
    tags: ['KRITIS', 'LANTAS'],
    time: '14:38',
    priority: 'critical'
  },
  {
    id: '2',
    icon: 'fa-solid fa-bolt-lightning',
    title: 'Spike Provokasi Medsos — "Demo"',
    description: '+280% dalam 1 jam. Platform X & Facebook. Lokasi terkait: Alun-alun. Monitoring intensif.',
    tags: ['WASPADA', 'INTELKAM'],
    time: '14:22',
    priority: 'high'
  },
  {
    id: '3',
    icon: 'fa-solid fa-bullseye',
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
  const addToast = useAppStore((s) => s.addToast);

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
      { msg: 'Data DUKCAPIL disinkronkan — 247 record baru', type: 'info' as const },
      { msg: 'Keyword "begal" naik +45% di TikTok', type: 'alert' as const },
      { msg: 'SKT-03 berhasil melewati titik rawan A7', type: 'success' as const },
      { msg: 'Model AI prediktif diperbarui — akurasi 87.3%', type: 'info' as const },
      { msg: 'Laporan 110 baru: Keributan Jl. Diponegoro', type: 'alert' as const },
    ];
    
    let alertIdx = 0;
    const interval = setInterval(() => {
      const a = alerts[alertIdx % alerts.length];
      addToast(a.msg, a.type);
      alertIdx++;
    }, 15000);

    return () => clearInterval(interval);
  }, [currentPage, addToast]);

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLoginSuccess={() => window.location.hash = '#/dashboard'} />;
      case 'dashboard': return <Dashboard />;
      case 'osint': return <Osint />;
      case 'predictive-analytics': return <PredictiveAnalytics />;
      case 'crime-mapping': return <CrimeMapping />;
      case 'investigation-management': return <InvestigationManagement />;
      case 'security-integrity': return <SecurityIntegrity />;
      case 'disaster-mitigation': return <DisasterMitigation />;
      case 'weather-forecast': return <WeatherForecast />;
      case 'commodities-price': return <CommoditiesPrice />;
      case 'security-mitigation': return <SecurityMitigation />;
      case 'api-docs': return <ApiDocs />;
      default: return <Dashboard />;
    }
  };

  const isLoginPage = currentPage === 'login';
  const isStandalonePage = currentPage === 'login' || currentPage === 'api-docs';

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 font-rajdhani ews-grid-bg ews-scanline">
      {!isStandalonePage && (
        <Sidebar currentPage={currentPage} />
      )}

      <div className={`${isStandalonePage ? '' : 'ml-72'} min-h-screen flex flex-col`}>
        {!isStandalonePage && (
          <Topbar 
            title={pageTitles[currentPage]}
            subtitle={pageSubtitles[currentPage]}
            currentTime={currentTime}
            alertCount={3}
            onAlertClick={() => setIsAlertModalOpen(true)}
          />
        )}

        <main className={`${isStandalonePage ? 'p-0' : 'flex-1 p-5'}`}>
          {renderPage()}
        </main>
      </div>

      {!isStandalonePage && (
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
