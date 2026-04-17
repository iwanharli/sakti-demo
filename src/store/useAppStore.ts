import { create } from 'zustand';
import Swal from 'sweetalert2';
import type { Toast } from '../types';

interface AppStore {
  addToast: (message: string, type: Toast['type']) => void;
  // Commodity Filters
  selectedRegion: string;
  selectedDate: string;
  selectedSource: string;
  setSelectedRegion: (region: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSource: (source: string) => void;
}

export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = 8440; // Backend specific port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:${port}/api`;
    }
    // Default to current hostname and port 8440
    return `http://${hostname}:${port}/api`;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8440/api';
};

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = sessionStorage.getItem('sakti_token');
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
    'Authorization': `Bearer ${token}`,
  };

  // Only set application/json if not uploading files (FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    // Session expired or invalid
    sessionStorage.removeItem('sakti_auth');
    sessionStorage.removeItem('sakti_token');
    window.location.href = '/#/login'; 
    throw new Error('Sesi Berakhir. Silakan Login Kembali.');
  }

  return response;
};

export const useAppStore = create<AppStore>()((set) => ({
  selectedRegion: 'Nasional',
  selectedDate: '',
  selectedSource: 'SP2KP',
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedSource: (source) => set({ selectedSource: source }),
  addToast: (message: string, type: Toast['type'] = 'info') => {
    const iconMap = {
      success: '<i class="fa-solid fa-circle-check text-emerald-400"></i>',
      info: '<i class="fa-solid fa-circle-info text-cyan-400"></i>',
      warning: '<i class="fa-solid fa-triangle-exclamation text-amber-400"></i>',
      error: '<i class="fa-solid fa-circle-xmark text-red-500"></i>',
      alert: '<i class="fa-solid fa-bell text-amber-500"></i>'
    };

    const borderMap = {
      success: 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      info: 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      warning: 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      error: 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
      alert: 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
    };

    const progressColorMap = {
      success: '#10b981',
      info: '#06b6d4',
      warning: '#f59e0b',
      error: '#ef4444',
      alert: '#f59e0b'
    };

    const ToastMixin = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      didOpen: (toast: HTMLElement) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
        const progressBar = toast.querySelector('.swal2-timer-progress-bar') as HTMLElement;
        if (progressBar) {
          progressBar.style.backgroundColor = progressColorMap[type as keyof typeof progressColorMap] || '#06b6d4';
        }
      },
      customClass: {
        popup: `border border-white/10 backdrop-blur-2xl rounded-xl py-2 px-5 w-fit min-w-[400px] max-w-[650px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] ${borderMap[type as keyof typeof borderMap] || borderMap.info}`,
        htmlContainer: 'm-0 p-0 w-full',
        timerProgressBar: 'rounded-b-xl h-[2px] opacity-60'
      }
    });

    ToastMixin.fire({
      html: `
        <div class="flex items-center gap-4 px-1 text-left">
          <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner">
            <span class="text-[16px]">${iconMap[type as keyof typeof iconMap] || iconMap.info}</span>
          </div>
          <div class="font-rajdhani font-bold text-[13px] text-white tracking-wide leading-tight flex-1">
            ${message}
          </div>
        </div>
      `,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    });
  },
}));
