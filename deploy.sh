#!/usr/bin/env sh

# SAKTI - Professional Server Deployment Script
# Optimized for Production at 84.247.145.144

# Abort on errors
set -e

echo "🚀 Memulai proses update SAKTI di server..."

# 0. Security & Integrity Check
if [ ! -f .env ]; then
    echo "❌ ERROR: File .env tidak ditemukan! Build frontend membutuhkan variabel environment."
    echo "Silakan pastikan file .env sudah tersedia di root folder."
    exit 1
fi

# 1. Pull latest code
echo "📡 Menarik kode terbaru dari repositori..."
git pull origin main

# 2. Synchronize Dependencies (Root & Frontend)
echo "📦 Menyinkronkan dependensi utama..."
npm install

# 3. Build Frontend (Produces 'dist' folder)
echo "🏗️ Membangun ulang Frontend (Production Build)..."
npm run build

# 4. Prepare & Build Backend
echo "📡 Menyiapkan Backend Intelligence..."
cd server
cp ../.env .
npm install
echo "🏗️ Mengompilasi TypeScript ke JavaScript (Optimized)..."
npm run build

# 5. Production Process Management
echo "🔄 Me-restart Backend dengan PM2 (Production Mode)..."
# We use 'delete/start' cycle to ensure all ENV changes are loaded fresh
npx pm2 delete demo-sakti-backend-8440 || true
PORT=8440 npx pm2 start "npm start" --name "demo-sakti-backend-8440"

cd ..

echo "✅ KONFIGURASI BERHASIL! Aplikasi SAKTI telah diperbarui dan berjalan di mode produksi."
echo "🔗 Frontend: http://84.247.145.144:8444 (via Nginx/Preview)"
echo "🔗 Backend: http://84.247.145.144:8440/api"
