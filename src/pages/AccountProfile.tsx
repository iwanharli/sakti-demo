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
  phone?: string;
}

export default function AccountProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);

  // States for inline editing
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    const userData = sessionStorage.getItem('sakti_user');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      setEditName(u.name || '');
      setEditPhone(u.phone || '');
    }
    fetchLoginLogs();
  }, []);

  const fetchLoginLogs = async () => {
    try {
      const res = await authFetch(`${API_BASE}/auth/login-logs`);
      if (res.ok) {
        const data = await res.json();
        setLoginLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch login logs:', err);
    }
  };

  const handleUpdateProfile = async (field: 'name' | 'phone') => {
    if (!user) return;
    
    // Validation
    if (field === 'name' && !editName.trim()) {
      addToast('Nama Lengkap tidak boleh kosong!', 'error');
      setEditName(user.name);
      setIsEditingName(false);
      return;
    }

    setIsUpdating(true);
    try {
      let finalName = field === 'name' ? editName : user.name;
      let finalPhone = field === 'phone' ? editPhone : user.phone;

      // Auto-format phone: replace leading '0' with '62' and remove non-digits
      if (field === 'phone' && finalPhone) {
        let cleaned = finalPhone.replace(/\D/g, ''); // hanya angka
        if (cleaned.startsWith('0')) {
          cleaned = '62' + cleaned.substring(1);
        }
        finalPhone = cleaned;
        setEditPhone(cleaned); // update UI state also
      }

      const payload = {
        name: finalName,
        phone: finalPhone,
      };

      const res = await authFetch(`${API_BASE}/auth/update-profile`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal memperbarui profil');
      }

      // Success
      const updatedUser = { ...user, ...payload };
      setUser(updatedUser);
      sessionStorage.setItem('sakti_user', JSON.stringify(updatedUser));
      addToast(`Data ${field === 'name' ? 'Nama' : 'Telepon'} berhasil diperbarui`, 'success');
      
      // Notify Topbar
      window.dispatchEvent(new Event('sakti_user_updated'));
      
      setIsEditingName(false);
      setIsEditingPhone(false);
    } catch (err: any) {
      addToast(err.message, 'error');
      // Reset temp values on error
      if (field === 'name') setEditName(user.name);
      if (field === 'phone') setEditPhone(user.phone || '');
    } finally {
      setIsUpdating(false);
    }
  };

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
        body: formData
      } as any);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mengunggah foto');
      }

      const { photoUrl } = await res.json();
      
      if (user) {
        const updatedUser = { ...user, picture: photoUrl };
        setUser(updatedUser);
        sessionStorage.setItem('sakti_user', JSON.stringify(updatedUser));
        addToast('Foto profil berhasil diperbarui', 'success');
        window.dispatchEvent(new Event('sakti_user_updated'));
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return 'N/A';
    if (phone.startsWith('62')) {
      return `(+62) ${phone.substring(2)}`;
    }
    return phone;
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* Hero Header Section - High Fidelity */}
      <div className="relative h-80 overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl group">
        {/* Background Layer */}
        <div className="absolute inset-0">
          <img 
            src="/profile-bg.png" 
            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
            alt="Tactical Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/60 to-transparent" />
          <div className="absolute inset-0 bg-[#0a0f1a]/20 backdrop-blur-[2px]" />
        </div>

        {/* HUD Decoration */}
        <div className="absolute top-8 right-8 flex gap-4">
          <div className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[10px] font-orbitron font-bold text-white tracking-[0.2em] uppercase">Status: ACTIVE</span>
          </div>
          <div className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3">
             <i className="fa-solid fa-server text-cyan-400 text-[10px]"></i>
            <span className="text-[10px] font-orbitron font-bold text-white tracking-[0.2em] uppercase">Server: JKT-01</span>
          </div>
        </div>

        {/* Profile Identity Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-10 flex flex-col md:flex-row items-end gap-8">
          <div className="relative shrink-0 group/avatar cursor-pointer" onClick={handlePhotoClick}>
            <div className="w-40 h-40 rounded-[2rem] bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 p-[2px] shadow-2xl overflow-hidden group-hover/avatar:shadow-cyan-500/20 transition-all duration-500">
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-[#0a0f1a] relative flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                ) : (
                  <span className="text-6xl font-orbitron font-black text-white/20">{user.name.charAt(0)}</span>
                )}
                
                {/* Upload Overlay */}
                <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 ${isUploading ? 'opacity-100' : ''}`}>
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
                  ) : (
                    <>
                      <i className="fa-solid fa-camera text-white text-3xl mb-2 translate-y-2 group-hover/avatar:translate-y-0 transition-transform"></i>
                      <span className="text-[10px] font-bold text-white tracking-widest uppercase">Ganti Foto</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <span className="px-4 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-[10px] font-orbitron font-black text-cyan-400 tracking-[0.3em] uppercase">
                {user.role}
              </span>
              <span className="px-4 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] font-orbitron font-black text-emerald-400 tracking-[0.3em] uppercase flex items-center gap-2">
                <i className="fa-solid fa-shield-halved"></i> Verified Personnel
              </span>
            </div>
            <h1 className="text-5xl font-orbitron font-black text-white tracking-tighter uppercase mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {user.name}
            </h1>
            <div className="flex flex-wrap gap-6 text-white/50">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-lg">
                <i className="fa-solid fa-fingerprint text-cyan-500 text-xs"></i>
                <span className="text-xs font-bold font-orbitron tracking-widest">{user.nrp}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-lg">
                <i className="fa-solid fa-envelope text-cyan-500 text-xs"></i>
                <span className="text-xs font-bold tracking-wider">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Pillars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pillar 1: Bio-Data Personel */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
             <div className="w-1 h-6 bg-cyan-500 rounded-full" />
             <h3 className="font-orbitron font-black text-sm text-white tracking-[0.2em] uppercase">Identitas Personel</h3>
          </div>
          
          <div className="bg-[#0a0f1a]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-xl">
            {/* Nama Lengkap Editable */}
            <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl group/field relative hover:bg-white/[0.05] transition-colors">
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-bold">Nama Lengkap SAKTI</div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-black/40 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all"
                    autoFocus
                  />
                  <button onClick={() => handleUpdateProfile('name')} className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                    <i className="fa-solid fa-check text-xs"></i>
                  </button>
                  <button onClick={() => { setIsEditingName(false); setEditName(user.name); }} className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                    <i className="fa-solid fa-times text-xs"></i>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-gray-100 tracking-wide uppercase">{user.name}</div>
                  <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover/field:opacity-100 transition-all text-cyan-500 hover:bg-cyan-500/10 p-2 rounded-lg">
                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Nomor Telepon Editable */}
            <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl group/field relative hover:bg-white/[0.02] transition-colors">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Nomor Telepon</div>
                {!user.phone && (
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-[8px] font-black text-amber-500 tracking-widest animate-pulse">
                    LENGKAPI SEKARANG
                  </span>
                )}
              </div>
              {isEditingPhone ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="flex-1 bg-black/40 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all"
                    autoFocus
                  />
                  <button onClick={() => handleUpdateProfile('phone')} className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                    <i className="fa-solid fa-check text-xs"></i>
                  </button>
                  <button onClick={() => { setIsEditingPhone(false); setEditPhone(user.phone || ''); }} className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                    <i className="fa-solid fa-times text-xs"></i>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-gray-100 tracking-wide">{formatPhoneNumber(user.phone)}</div>
                  <button onClick={() => setIsEditingPhone(true)} className="opacity-0 group-hover/field:opacity-100 transition-all text-cyan-500 hover:bg-cyan-500/10 p-2 rounded-lg">
                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl relative">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Email Kedinasan</div>
                {!user.email && (
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-[8px] font-black text-amber-500 tracking-widest animate-pulse">
                    LENGKAPI SEKARANG
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-white/90 break-all">{user.email || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Pillar 2: Otoritas & Penugasan */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
             <div className="w-1 h-6 bg-purple-500 rounded-full" />
             <h3 className="font-orbitron font-black text-sm text-white tracking-[0.2em] uppercase">Otoritas & Tugas</h3>
          </div>

          <div className="bg-[#0a0f1a]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-xl">
            <div className="p-6 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl relative overflow-hidden group/role">
              <div className="relative z-10">
                <div className="text-[10px] text-purple-400 uppercase tracking-[0.2em] mb-4 font-black">Level Otoritas</div>
                <div className="text-2xl font-orbitron font-black text-white mb-2 uppercase tracking-tighter">{user.role}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Akses Komando Penuh</div>
              </div>
              <i className="fa-solid fa-user-shield absolute top-6 right-6 text-purple-500/20 text-5xl group-hover/role:scale-110 transition-transform"></i>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-bold">Wilayah</div>
                <div className="text-xs font-black text-white uppercase tracking-widest">Nasional</div>
              </div>
              <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-bold">Unit Kerja</div>
                <div className="text-xs font-black text-white uppercase tracking-widest">Sakti-01</div>
              </div>
            </div>

            <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-emerald-500/70 uppercase tracking-[0.2em] mb-1 font-bold">Kepatuhan Data</div>
                <div className="text-sm font-black text-emerald-400 uppercase">100% Compliant</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                 <i className="fa-solid fa-check-double text-emerald-500"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 3: Keamanan */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
             <div className="w-1 h-6 bg-amber-500 rounded-full" />
             <h3 className="font-orbitron font-black text-sm text-white tracking-[0.2em] uppercase">Keamanan</h3>
          </div>

          <div className="bg-[#0a0f1a]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 space-y-4 shadow-xl">
             <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group/sec">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover/sec:bg-cyan-500/20 transition-all">
                     <i className="fa-solid fa-lock-open text-cyan-400"></i>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Sandi Keamanan</div>
                    <div className="text-sm font-bold text-white tracking-[0.3em]">********</div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest border border-white/10 transition-all">
                  Update
                </button>
             </div>

             <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                   <i className="fa-solid fa-shield-virus text-emerald-500"></i>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-500/70 uppercase tracking-[0.2em] font-bold">Enkripsi SAKTI</div>
                  <div className="text-xs font-black text-white uppercase tracking-widest">End-to-End active</div>
                </div>
             </div>

             <div className="p-8 mt-4 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/5 flex items-center justify-center mb-4">
                   <i className="fa-solid fa-user-gear text-cyan-500 text-2xl"></i>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-2">Konfigurasi Lanjutan</h4>
                <p className="text-[10px] text-gray-500 max-w-[150px] leading-relaxed mb-6 italic">Kelola preferensi login dan kunci otentikasi biometrik Anda</p>
                <div className="w-full h-[2px] bg-white/5 mb-6" />
                <button className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] hover:text-cyan-300 transition-colors">
                  Buka Pengaturan Keamanan
                </button>
             </div>

             {/* Login Activity Feed */}
             <div className="mt-8 space-y-4">
               <div className="flex items-center justify-between px-2">
                 <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Aktivitas Sesi Terakhir</h4>
                 <div className="w-12 h-[1px] bg-white/10"></div>
               </div>

               <div className="space-y-3">
                 {loginLogs.length > 0 ? (
                   loginLogs.map((log) => (
                     <div key={log.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group/log hover:bg-white/[0.04] transition-all">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 group-hover/log:border-cyan-500/30 transition-all">
                            <i className={`${getDeviceIcon(log.user_agent)} text-sm`}></i>
                         </div>
                         <div>
                           <div className="text-[11px] font-black text-gray-200 uppercase tracking-tight">{getDeviceName(log.user_agent)}</div>
                           <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{log.ip_address} • {log.location}</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-[9px] font-black text-cyan-500/70 uppercase">{new Date(log.created_at).toLocaleTimeString()}</div>
                         <div className="text-[8px] text-gray-600 font-bold uppercase">{new Date(log.created_at).toLocaleDateString()}</div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-8 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                     <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Belum ada riwayat aktivitas</p>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
