import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import PageTransitionLoader from './components/PageTransitionLoader';
import CommandCenter from './pages/CommandCenter';
import Osint from './pages/Osint';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import CrimeMapping from './pages/CrimeMapping';
import KamtibmasManagement from './pages/KamtibmasManagement';
import SecurityIntegrity from './pages/SecurityIntegrity';
import DisasterHistory from './pages/DisasterHistory';
import WeatherForecast from './pages/WeatherForecast';
import CommoditiesPrice from './pages/CommoditiesPrice';
import CommodityDetail from './pages/CommodityDetail';
import SecurityMitigation from './pages/SecurityMitigation';
import ApiDocs from './pages/ApiDocs';
import AccountProfile from './pages/AccountProfile';
import Login from './pages/Login';
import AlertModal from './components/AlertModal';
import { useAppStore } from './store/useAppStore';
import type { AlertItem } from './types';

export type PageType = 
  | 'login'
  | 'command-center' 
  | 'osint' 
  | 'predictive-analytics' 
  | 'crime-mapping' 
  | 'kamtibmas-management' 
  | 'security-integrity' 
  | 'disaster-history' 
  | 'weather-forecast' 
  | 'commodities-price' 
  | 'sp2kp'
  | 'pihps'
  | 'security-mitigation'
  | 'account-profile'
  | 'api-docs';

const pageTitles: Record<PageType, string> = {
  login: 'AUTENTIKASI SISTEM',
  'command-center': 'COMMAND CENTER',
  osint: 'OSINT',
  'predictive-analytics': 'ANALITIK PREDIKTIF',
  'crime-mapping': 'DYNAMIC CRIME MAPPING',
  'kamtibmas-management': 'MANAJEMEN KAMTIBMAS',
  'security-integrity': 'INTEGRITAS SISTEM',
  'disaster-history': 'HISTORI BENCANA',
  'weather-forecast': 'WEATHER FORECAST',
  'commodities-price': 'HARGA SEMBAKO',
  'sp2kp': 'DETAIL ANALITIK KOMODITAS',
  'pihps': 'DETAIL ANALITIK KOMODITAS',
  'security-mitigation': 'MITIGASI KEAMANAN',
  'account-profile': 'PROFIL PERSONEL',
  'api-docs': 'API DOCUMENTATION'
};

const pageSubtitles: Record<PageType, string> = {
  login: 'Otoritas Akses Sistem SAKTI',
  'command-center': 'Pusat Kendali Operasional Terintegrasi',
  osint: 'Intelegensi Media Sosial & Analisis Sinyal',
  'predictive-analytics': 'Sistem Peringatan Dini Berbasis Vektor AI',
  'crime-mapping': 'Visualisasi Spasial Kepadatan Kriminalitas',
  'kamtibmas-management': 'Administrasi Kamtibmas & Penelusuran Keamanan',
  'security-integrity': 'Integritas Sistem & Audit Keamanan',
  'disaster-history': 'Pusat Data Historis & Analitik Kejadian Bencana Alam',
  'weather-forecast': 'Analisis Cuaca & Prediksi Atmosferik',
  'commodities-price': 'Pemantauan Harga Pangan & Inflasi',
  'sp2kp': 'Visualisasi Tren Historis & Analitik Harga Mendalam',
  'pihps': 'Visualisasi Tren Historis & Analitik Harga Mendalam',
  'security-mitigation': 'Strategi Pencegahan & Mitigasi Kejahatan',
  'account-profile': 'Detail Identitas & Otoritas Personel SAKTI',
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(true);
  const [commodityParam, setCommodityParam] = useState('');
  const { addToast, setSelectedSource } = useAppStore();

  // --- NATIVE HASH ROUTING LOGIC ---
  useEffect(() => {
    const handleHashChange = () => {
      const fullHash = window.location.hash.replace('#/', '');
      const [hash, param] = fullHash.split('/');
      
      // Dynamic Parameter Mapping
      if ((hash === 'sp2kp' || hash === 'pihps') && param) {
        setCommodityParam(param);
        setSelectedSource(hash.toUpperCase());
      } else {
        setCommodityParam('');
      }
      
      // Validation & Guard
      const isValidPage = pageTitles[hash as PageType] !== undefined;
      const isAuthenticated = sessionStorage.getItem('sakti_auth') === 'true';

      if (!isValidPage) {
        window.location.hash = isAuthenticated ? '#/command-center' : '#/login';
        return;
      }

      // Force login if not authenticated
      if (hash !== 'login' && !isAuthenticated) {
        window.location.hash = '#/login';
        return;
      }

      // Role-based Access Control (RBAC)
      if (hash === 'security-integrity') {
        const user = JSON.parse(sessionStorage.getItem('sakti_user') || '{}');
        if (user.role !== 'admin') {
          addToast('Akses ditolak: Area terbatas untuk ADMIN saja.', 'error');
          window.location.hash = '#/command-center';
          return;
        }
      }

      // Trigger transition sequence with Smart Sync
      setIsTransitioning(true);
      setMinTimeElapsed(false);
      
      // Delay the actual page swap slightly for a smoother transition
      setTimeout(() => {
        setCurrentPage(hash as PageType);
      }, 150);

      // Set minimum visual threshold (800ms)
      setTimeout(() => {
        setMinTimeElapsed(true);
      }, 800);
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

  // --- SMART LOADING COMPLETION HOOK ---
  const activeRequests = useAppStore(state => state.activeRequests);
  useEffect(() => {
    // Only dismiss if transition is active, minimum time has passed, 
    // AND all network requests have completed.
    if (isTransitioning && minTimeElapsed && activeRequests.length === 0) {
      // Small buffer before final fade out
      const timer = setTimeout(() => setIsTransitioning(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, minTimeElapsed, activeRequests]);

  // Fail-safe: Force exit after 6s in case of hanging requests
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setMinTimeElapsed(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

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
        return <Login onLoginSuccess={() => window.location.hash = '#/command-center'} />;
      case 'command-center': return <CommandCenter />;
      case 'osint': return <Osint />;
      case 'predictive-analytics': return <PredictiveAnalytics />;
      case 'crime-mapping': return <CrimeMapping />;
      case 'kamtibmas-management': return <KamtibmasManagement />;
      case 'security-integrity': return <SecurityIntegrity />;
      case 'disaster-history': return <DisasterHistory />;
      case 'weather-forecast': return <WeatherForecast />;
      case 'commodities-price': return <CommoditiesPrice />;
      case 'sp2kp': 
      case 'pihps': 
        return <CommodityDetail commodityCode={commodityParam} />;
      case 'security-mitigation': return <SecurityMitigation />;
      case 'account-profile': return <AccountProfile />;
      case 'api-docs': return <ApiDocs />;
      default: return <CommandCenter />;
    }
  };

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

        <main className={`${isStandalonePage ? 'p-0' : 'flex-1 p-5'} relative overflow-hidden`}>
          <PageTransitionLoader isVisible={isTransitioning} isStandalone={isStandalonePage} />
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
