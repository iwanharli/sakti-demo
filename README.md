# SAKTI - Sistem Analisis Kamtibmas & Taktis Terintegrasi

**SAKTI** adalah platform *Command Center* tingkat tinggi yang dirancang dengan estetika **Cyber-Tactical**. Dashboard ini dioptimalkan untuk pemantauan keamanan (Kamtibmas), mitigasi bencana, analitik intelijen, dan kolaborasi sektoral secara profesional dan *real-time*.

![Version](https://img.shields.io/badge/version-2.1.0--tactical-cyan)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

## 💎 Konsep Desain: Cyber-Tactical Identity
Berbeda dengan dashboard standar, SAKTI menggunakan bahasa desain **Cyber-Tactical** yang mengutamakan efisiensi informasi dan estetika futuristik:
- **Glassmorphism HUD**: Antarmuka transparan dengan efek *backdrop-blur* tinggi untuk kedalaman visual.
- **High-Precision Typography**: Menggunakan font *Orbitron* untuk elemen identitas dan *Rajdhani/Mono* untuk data operasional.
- **Tactical Color Coding**: Skema warna fungsional (Cyan/Emerald untuk status normal, Amber/Red untuk peringatan) dengan pendaran neon halus.

## 🚀 Fitur Utama & Modernisasi UI
Seluruh modul telah melalui tahap modernisasi untuk mencapai standar *Command Center* operasional:

### 1. Modernized Weather HUD
- **Single-Line Streamlined Header**: Reduksi gangguan visual dengan header tipis yang fokus pada metrik utama.
- **Integrated Map HUD**: Kontrol peta (seleksi sektor & nasional) kini terintegrasi sebagai elemen HUD melayang di dalam area peta.
- **Scrollable Timeline**: 7-Day Forecast dengan fitur *horisontal scroll* dan *auto-focus* pada hari ini.

### 2. Premium Sidebar Branding
- **Hex-Shield Identity**: Logo "S" dengan desain perisai taktis hexagonal yang memiliki efek *chrome reflection* dan *neon pulse*.
- **Tactical Navigation**: Penggunaan label kategori institusional (seperti "POLRES KOTA METRO") dengan aksen *border-left* perak.
- **Dynamic Active Indicators**: Bar indikator aktif dengan pendaran neon cyan.

### 3. Tactical Minimalist Notifications
- **Custom SweetAlert2 Overhaul**: Mengganti notifikasi standar dengan *Toast* kecil yang elegan.
- **Dynamic Neon Borders**: Warna bingkai notifikasi berubah secara dinamis sesuai tipe pesan (Info, Success, Warning, Error).
- **Non-Intrusive UX**: Tanpa *progress bar* yang mengganggu, menggunakan ikon FontAwesome yang minimalis.

## 🛠️ Tech Stack
- **Frontend**: React 19 (Component-Based), TypeScript (Strict Mode).
- **Styling**: Tailwind CSS dengan kustomisasi *Tactical Utilities*.
- **Mapping**: React-Leaflet dengan *high-resolution city boundaries*.
- **State Management**: Zustand untuk sinkronisasi data antar modul.
- **Documentation**: Scalar API Reference terintegrasi.
- **Notifications**: SweetAlert2 (Custom Tactical Mixin).

## 🗄️ Struktur Data Modular (`src/data/`)
Data operasional dipisahkan ke dalam modul mandiri untuk memudahkan integrasi API di masa depan:

| Modul | Deskripsi Fungsi |
|-------|------------------|
| `mockOsint.ts` | Analisis sentimen media sosial & deteksi provokasi. |
| `mockWeatherForecast.ts` | Data klimatologi & korelasi kerawanan cuaca. |
| `mockPredictiveAnalytics.ts` | Prediksi residivisme & pemetaan titik panas kejahatan. |
| `mockCommoditiesPrice.ts` | Pantauan harga sembako & deteksi anomali ekonomi. |

## 🏁 Cara Menjalankan
1. Pastikan Node.js telah terinstal.
2. Install depedensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```

---
*Dashboard ini dikembangkan untuk kebutuhan operasional taktis dengan standar keamanan dan integritas data tinggi.*
