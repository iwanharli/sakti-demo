# SAKTI - Early Warning System & Command Center

SAKTI (Sistem Analisis Kamtibmas & Taktis Terintegrasi) adalah platform *dashboard command center* tingkat tinggi dengan antarmuka tematik *Cyberpunk* / *High-Tech*. Proyek ini dirancang untuk pemantauan keamanan kota/kabupaten secara menyeluruh (Kamtibmas, mitigasi bencana, analitik kejahatan prediktif, pantauan sembako, dan keamanan siber).

## 🗄️ Database Mock Structure (`src/data/`)

Untuk menjaga agar komponen UI (React) tetap bersih dan siap untuk integrasi API di masa depan, seluruh *dummy data* / *mock data* yang sebelumnya menumpuk pada `src/pages/` telah diekstrak ke dalam modul modular di `src/data/`.

Berikut adalah struktur data yang digunakan pada masing-masing modul:

| Modul File | Representasi / Fungsi Data |
|------------|----------------------------|
| **`mockDashboard.ts`** | Metrik *Command Center* utama, log aktivitas harian, pemantauan status *server*/platform, dan status AI. |
| **`mockOsint.ts`** | Penangkapan sinyal dari media sosial (*Social Sensing*), *keyword alerting* untuk deteksi provokasi, deteksi tren, dan sentimen real-time. |
| **`mockPredictiveAnalytics.ts`** | Data prediksi kejahatan berdasarkan riwayat (*Recidivism Risk*), prediksi titik panas (*hotspot*), dan *early warning markers*. |
| **`mockCrimeMapping.ts`** | Data peta dinamis, GPS *tracking* unit patroli *real-time*, dan algoritma *Smart Patrol Routing* (Lantas & Sabhara). |
| **`mockInvestigationManagement.ts`** | Transparansi perkembangan kasus (Reskrim), status *SP2HP* (Surat Pemberitahuan Perkembangan Hasil Penyidikan), dan manajemen barang bukti. |
| **`mockSectoralCollaboration.ts`** | Log integrasi lintas sektoral/instansi (Kemenkes, Dukcapil, dll), permohonan data, dan *insight* intelijen gabungan. |
| **`mockSecurityIntegrity.ts`** | Sistem keamanan siber berjenjang (Propam / TIK), *audit trailing* sistem, dan pemantauan ancaman internal (*Insider Threats*). |
| **`mockDisasterMitigation.ts`** | Notifikasi bahaya alam (BMKG), status persediaan logistik, tingkat kerawanan wilayah, dan sistem evakuasi. |
| **`mockWeatherForecast.ts`** | Pemantauan iklim (*klimatologi*), prakiraan cuaca, dan hubungannya/korelasi dengan tingkat kejahatan atau kerawanan darurat. |
| **`mockCommoditiesPrice.ts`** | *Scraping* / pemantauan harga sembako, status stok pasar harian, dan sistem deteksi waspada hiperinflasi yang dapat menyebabkan gejolak sosial. |
| **`mockSecurityMitigation.ts`** | Matriks risiko keamanan spasial (per kecamatan), pemantauan kerumunan / unjuk rasa, status operasi utilitas & objek vital. |

### 📋 Contoh Struktur Data (Mock Data)

Berikut adalah beberapa contoh representasi *array of objects* yang digunakan sebagai standar data komponen:

**1. `mockOsint.ts`**
```typescript
export const keywordAlerts = [
  { 
    keyword: 'demo · kerusuhan', 
    platform: 'X, FB', 
    volume: '3,240', 
    spike: '+280%', 
    spikeColor: 'red', 
    sentiment: 'NEGATIF', 
    sentimentColor: 'red', 
    status: '🚨 ALERT', 
    statusColor: 'red' 
  }
];
```

**2. `mockPredictiveAnalytics.ts`**
```typescript
export const recidivismData = [
  { 
    id: '1', 
    initials: 'RS', 
    name: 'Rahmat S.', 
    description: 'Eks-napi Curanmor · Bebas 2 bln lalu', 
    score: 89, 
    riskLevel: 'high' // 'high' | 'medium' | 'low'
  }
];
```

**3. `mockDisasterMitigation.ts`**
```typescript
export const bencanaAlerts = [
  { 
    time: '14:30 WIB', 
    source: 'BMKG', 
    content: 'Peringatan Dini Hujan Lebat...', 
    tags: ['SIAGA', 'BMKG'], 
    color: 'red' // 'red' | 'amber' | 'green' | 'cyan'
  }
];
```

### 🌍 Sumber Data Eksternal yang Dibutuhkan (Integrasi Data)

Untuk membuat aplikasi SAKTI berjalan secara *real-time* dan sesuai dengan fungsinya sebagai *Command Center* intelijen terpadu, aplikasi ini akan membutuhkan asupan data (integrasi API/Webhook) dari lembaga atau entitas berikut:

1. **API Media Sosial (Twitter/X, Meta, TikTok)**: Untuk menyuplai data *Social Sensing*, analisis sentimen, pergerakan tren kata kunci provokasi (Modul OSINT).
2. **Database Internal Polri (SPKT, E-Tilang, dll)**: Untuk menyuplai data kriminalitas mentah, laporan masuk 110, status SP2HP, dan riwayat residivis (Modul Reskrim & Analitik Prediktif).
3. **GPS Telematics (Kendaraan Dinas)**: Data *real-time tracking* latitude/longitude dari unit patroli Sabhara dan Lantas (Modul Crime Mapping).
4. **API Cuaca & Bencana Alam (BMKG)**: Data peringatan dini (*early warning*), curah hujan, indikator suhu, angin, indeks UV, dan gempa bumi (Modul Prediksi Cuaca & Mitigasi Bencana).
5. **Database Sektoral Pemkot/Pemda & BPS**: Data kependudukan (Dukcapil), data rumah sakit umum (Kemenkes), pergerakan ekonomi, kemiskinan, dan inflasi (Modul Kolaborasi Sektoral).
6. **Data Scraping / Disperindag**: Harga eceran sembako di pasar tradisional dan ritel modern untuk mendeteksi anomali tinggi (hiperinflasi) yang bisa memicu gangguan kamtibmas (Modul Harga Sembako).

---

### 🚀 Cara Integrasi API Jangka Panjang
Seluruh data ini diekspor langsung sebagai konstan (`export const data = [...]`). Apabila platform SAKTI akan disambungkan ke **Real Backend API / Database Asli (seperti Postgres, MongoDB)**, Anda hanya perlu:
1. Menambahkan sintaks pengambil API seperti `useEffect()` dan `fetch()` di masing-masing *file components* di folder `src/pages/`.
2. Menghapus *import default data* dari folder `src/data/`.
3. Memetakan *response JSON* dari backend ke *state* lokal komponen tersebut secara dinamis.

## ✨ Fitur Teknis Pilihan
*   **Routing System** menggunakan *hash routing* (`#/dashboard`) dipetakan secara statis tanpa router library tambahan untuk meminimalkan beban di level *development*.
*   **Custom Notifications** melalui SweetAlert2 yang dikustomisasi dengan neon *cyberpunk aesthetic*.
*   **CSS Vanilla & TailwindCSS** untuk menciptakan bayangan *glow* halus (*box-shadow: 0 0 10px ...*) dan animasi futuristik yang dinamis.
*   **Fully Component-Based** untuk meminimalisir redundansi kode.

## 🛠️ Menjalankan Proyek
```bash
npm install
npm run dev
```

Platform akan segera berjalan di `http://localhost:5173/` 
Dibutuhkan browser versi modern yang mendukung ES6 Module untuk optimasi performa *Render*.
