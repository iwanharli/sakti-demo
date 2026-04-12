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
