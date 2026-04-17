import { useEffect, useState, useRef } from 'react';
import { useAppStore, getApiBase, authFetch } from '../store/useAppStore';

const API_BASE = getApiBase();
const SERVER_URL = API_BASE.replace('/api', '');

interface UserProfile {
  id: string;
  nrp: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
}

export default function AccountProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    const userData = sessionStorage.getItem('sakti_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      addToast('Hanya diperbolehkan format gambar!', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Ukuran file maksimal 10MB!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setIsUploading(true);
    try {
      const res = await authFetch(`${API_BASE}/auth/upload-profile`, {
        method: 'POST',
        headers: {
          // Note: fetch will set the correct Content-Type for FormData automatically
        },
        body: formData
      } as any);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mengunggah foto');
      }

      const { photoUrl } = await res.json();
      
      // Update local state and session storage
      if (user) {
        const updatedUser = { ...user, picture: photoUrl };
        setUser(updatedUser);
        sessionStorage.setItem('sakti_user', JSON.stringify(updatedUser));
        addToast('Foto profil berhasil diperbarui', 'success');
        
        // Custom event to notify Topbar
        window.dispatchEvent(new Event('sakti_user_updated'));
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const avatarUrl = user.picture ? `${SERVER_URL}${user.picture}` : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* Header Profile Section */}
      <div className="relative overflow-hidden bg-[#0a0f1a] border border-white/5 rounded-3xl p-8 shadow-2xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors duration-1000" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group/avatar cursor-pointer" onClick={handlePhotoClick}>
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-900 to-blue-700 border-2 border-cyan-400/50 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
              ) : (
                <span className="text-4xl font-orbitron font-black text-white">{user.name.charAt(0)}</span>
              )}
              
              {/* Overlay with Camera Icon */}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 ${isUploading ? 'opacity-100' : ''}`}>
                {isUploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : (
                  <i className="fa-solid fa-camera text-white text-2xl"></i>
                )}
              </div>
              
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-[#0a0f1a] w-8 h-8 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center">
              <i className="fa-solid fa-check text-[10px] text-white"></i>
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-orbitron font-black text-white tracking-tight mb-2 uppercase flex items-center gap-3 justify-center md:justify-start">
              {user.name}
              <span className="px-3 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] tracking-[0.2em] text-cyan-400">VERIFIED</span>
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <i className="fa-solid fa-id-card-clip text-cyan-500"></i>
                <span className="text-xs font-bold tracking-widest uppercase">NRP: {user.nrp}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-700 hidden md:block" />
              <div className="flex items-center gap-2 text-gray-400">
                <i className="fa-solid fa-envelope text-cyan-500"></i>
                <span className="text-xs font-bold tracking-widest uppercase">{user.email || 'N/A'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-700 hidden md:block" />
              <div className="flex items-center gap-2 text-gray-400 font-bold">
                <i className="fa-solid fa-user-shield text-cyan-500"></i>
                <span className="text-xs tracking-widest uppercase">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-[#0a0f1a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase">Identitas Akun</h3>
            <i className="fa-solid fa-fingerprint text-cyan-500/50 text-xl"></i>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Nama Lengkap</div>
              <div className="text-sm font-bold text-gray-200 tracking-wide">{user.name}</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">NRP / ID Personel</div>
              <div className="text-sm font-bold text-gray-200 tracking-wide">{user.nrp}</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Email Kedinasan</div>
              <div className="text-sm font-bold text-gray-200 tracking-wide">{user.email || 'Belum diisi'}</div>
            </div>
          </div>
        </div>

        {/* System Access */}
        <div className="bg-[#0a0f1a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-orbitron font-bold text-sm text-white tracking-widest uppercase">Akses & Keamanan</h3>
            <i className="fa-solid fa-lock text-cyan-500/50 text-xl"></i>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Tingkatan Akses</div>
                <div className="text-sm font-bold text-cyan-400 tracking-widest uppercase">{user.role}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <i className="fa-solid fa-key text-cyan-500"></i>
              </div>
            </div>
            
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1">Status Keamanan</div>
                <div className="text-sm font-bold text-emerald-400 tracking-widest uppercase">Fully Encrypted</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <i className="fa-solid fa-user-shield text-emerald-500"></i>
              </div>
            </div>

            <button className="w-full py-4 mt-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl text-xs font-bold text-gray-300 tracking-[0.2em] uppercase transition-all">
              Ubah Password SAKTI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
