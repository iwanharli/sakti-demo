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
  // Network Tracking
  activeRequests: string[];
  addRequest: (label: string) => void;
  removeRequest: (label: string) => void;
  updateRequest: (oldLabel: string, newLabel: string) => void;
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

  // Tactical Label Extraction for Loading UX
  const urlParts = url.split('/');
  const endpoint = urlParts[urlParts.length - 1]?.split('?')[0]?.toUpperCase() || 'DATA';
  const method = (options.method || 'GET').toUpperCase();
  const baseLabel = `${method}_${endpoint}`;
  let currentLabel = baseLabel;

  // Register request in store
  useAppStore.getState().addRequest(currentLabel);

  let attempts = 0;
  const maxRetries = 3;

  try {
    while (attempts < maxRetries) {
      try {
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401 || response.status === 403) {
          // Session expired or invalid
          sessionStorage.removeItem('sakti_auth');
          sessionStorage.removeItem('sakti_token');
          window.location.href = '/#/login'; 
          return response; // Return immediately to bypass the retry loop which catches thrown errors
        }

        return response;
      } catch (err) {
        attempts++;
        if (attempts >= maxRetries) {
          useAppStore.getState().updateRequest(currentLabel, `${baseLabel} [CRITICAL ERROR]`);
          throw err;
        }

        // Tactical feedback: update label to show retry status
        const nextLabel = `${baseLabel} [RETRYING ${attempts}/${maxRetries - 1}]`;
        useAppStore.getState().updateRequest(currentLabel, nextLabel);
        currentLabel = nextLabel;

        // Exponential-ish backoff or fixed tactical delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    throw new Error('Gagal menghubungi server setelah beberapa percobaan.');
  } finally {
    // Un-register the final version of the request label always
    useAppStore.getState().removeRequest(currentLabel);
  }
};

export const useAppStore = create<AppStore>()((set) => ({
  selectedRegion: 'Nasional',
  selectedDate: '',
  selectedSource: 'SP2KP',
  activeRequests: [],
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedSource: (source) => set({ selectedSource: source }),
  addRequest: (label) => set((state) => ({ 
    activeRequests: [...state.activeRequests, label] 
  })),
  removeRequest: (label) => set((state) => ({ 
    activeRequests: state.activeRequests.filter(r => r !== label) 
  })),
  updateRequest: (oldLabel, newLabel) => set((state) => ({
    activeRequests: state.activeRequests.map(r => r === oldLabel ? newLabel : r)
  })),
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

    // Direct CSS Injection to bypass any cache/specificity issues
    if (!document.getElementById('sakti-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'sakti-toast-styles';
      style.innerHTML = `
        .swal2-popup.ews-capsule-toast {
          border-radius: 9999px !important;
          padding: 8px 32px !important;
          overflow: hidden !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          margin-top: 0.75rem !important;
          margin-left: 15rem !important; /* Shifting to the right from the center */
        }
        .swal2-popup.ews-capsule-toast .swal2-html-container {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
        .swal2-timer-progress-bar-container {
          border-radius: 9999px !important;
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(style);
    }

    const ToastMixin = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: 'rgba(15, 23, 42, 0.95)',
      color: '#ffffff',
      width: 'auto', // Force content-based width
      didOpen: (toast: HTMLElement) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
        const progressBar = toast.querySelector('.swal2-timer-progress-bar') as HTMLElement;
        if (progressBar) {
          progressBar.style.backgroundColor = progressColorMap[type as keyof typeof progressColorMap] || '#06b6d4';
        }
      },
      customClass: {
        popup: `ews-capsule-toast backdrop-blur-2xl !max-w-none ${borderMap[type as keyof typeof borderMap] || borderMap.info}`,
        htmlContainer: '!m-0 !p-0',
      }
    });

    ToastMixin.fire({
      html: `
        <div class="flex items-center gap-5 text-left py-1">
          <div class="flex items-center justify-center flex-shrink-0">
            <span class="text-[16px]">${iconMap[type as keyof typeof iconMap] || iconMap.info}</span>
          </div>
          <div class="font-rajdhani font-bold text-[14px] text-white/90 tracking-wider whitespace-nowrap uppercase">
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
