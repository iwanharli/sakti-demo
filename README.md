# SAKTI - Sistem Analisis Kamtibmas & Taktis Terintegrasi

**SAKTI** adalah platform *Early Warning System* (EWS) dan *Command Center* tingkat tinggi yang dirancang untuk kebutuhan operasional taktis institusi keamanan. Menggabungkan estetika **Cyber-Tactical** dengan infrastruktur data yang tangguh untuk pengambilan keputusan real-time.

![Version](https://img.shields.io/badge/version-2.5.0--resilient-cyan)
![Build](https://img.shields.io/badge/build-passing-emerald)
![Security](https://img.shields.io/badge/security-hardened-blue)

## 📡 Infrastruktur Taktis (Core Engine)
Berbeda dengan dashboard standar, SAKTI dilengkapi dengan mesin komunikasi data yang dirancang untuk kondisi lapangan:

- **Smart Dynamic Transitions**: Navigasi antar modul yang cerdas—layar pemuatan tersinkronisasi langsung dengan aktivitas jaringan, memastikan konten hanya muncul saat data sudah benar-benar siap.
- **Resilient Data Fetching (Auto-Retry)**: Mesin komunikasi yang "gigih" dengan protokol percobaan ulang otomatis (3x retry) untuk menjaga stabilitas pantauan saat koneksi server tidak stabil.
- **Context-Aware Loading**: Log terminal vertikal yang menampilkan aktivitas jaringan secara real-time (`GET`, `RETRY`, `OK`, `ERR`) langsung pada layar transisi.

## 🕹️ Modul Operasional Utama
Sistem ini mengintegrasikan berbagai sumber intelijen ke dalam satu pusat kendali:

- **Command Center**: Dashboard eksekutif untuk pantauan situasi makro nasional.
- **OSINT Intelligence**: Analisis sentimen media sosial, tren provokasi, dan monitoring kata kunci kritis.
- **Predictive Analytics**: Pemetaan hot-spot kriminalitas dan analisis probabilitas residivisme berbasis AI.
- **Disaster History & Monitoring**: Integrasi data sensor lapangan IoT dan BMKG untuk pantauan bencana alam dan logistik darurat.
- **Economics Monitor (SP2KP/PIHPS)**: Pemantauan harga pangan nasional dan deteksi anomali inflasi pasar.

## 🔌 Dokumentasi API (OpenAPI 3.0)
SAKTI menyediakan API yang terdokumentasi secara teknis menggunakan Swagger/OpenAPI. Endpoint dapat diakses secara dinamis untuk integrasi pihak ketiga:

| Layanan | Endpoint | Deskripsi |
|---------|----------|-----------|
| **Auth** | `/api/login` | Autentikasi personel & distribusi JWT |
| **Kamtibmas** | `/api/kamtibmas/*` | Data sebaran kasus, statistik wilayah, & logistik |
| **OSINT** | `/api/osint/social-metrics` | Ekstraksi volume keyword & analisis sentimen |
| **Disaster** | `/api/weather/map-cities` | Data koordinat bencana & status anomali cuaca |
| **Economics** | `/api/commodities/*` | Perbandingan HET vs pasar & tren historis harga |

> [!NOTE]
> Dokumentasi teknis lengkap tersedia secara interaktif melalui endpoint `/api-docs` setelah server dijalankan.

## 🛠️ Technology Stack
SAKTI dibangun di atas teknologi modern untuk performa dan keamanan tinggi:

- **Frontend Core**: React 19, TypeScript (Strict Mode), Vite.
- **Styling**: Vanilla CSS & Tailwind (Tactical Utility Design).
- **Mapping Engine**: React-Leaflet dengan integrasi GADM GeoJSON (High Precision).
- **State Orchestration**: Zustand (Reactive System Storage).
- **API Architecture**: Scalar Swagger Reference untuk dokumentasi endpoint teknis.

## 🚀 Deployment & Setup
1. Pastikan lingkungan Node.js (LTS) tersedia.
2. Instalasi dependensi:
   ```bash
   npm install
   ```
3. Inisialisasi lingkungan operasional:
   ```bash
   npm run dev
   ```

---
*Dikembangkan dengan standar integritas data dan efisiensi informasi tinggi untuk pusat kendali operasional digital.*
