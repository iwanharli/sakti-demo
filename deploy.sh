#!/usr/bin/env sh

# SAKTI - Server Deployment Script
# Digunakan untuk menarik kode terbaru dan build di lingkungan server

# Abort on errors
set -e

echo "🚀 Memulai proses update di server..."

# 1. Pull latest code
echo "📡 Menarik kode terbaru dari repositori..."
git pull origin main

# 2. Install dependencies (jika ada perubahan package.json)
echo "📦 Menyinkronkan dependensi..."
npm install

# 3. Build for production (Frontend)
echo "🏗️ Membangun ulang aplikasi (Production Build)..."
npm run build

# 4. Sync & Restart Backend
echo "📡 Menyiapkan Backend..."
cd server
npm install
echo "🔄 Me-restart Backend dengan PM2..."
npx pm2 delete demo-sakti-backend-8440 || true
PORT=8440 npx pm2 start "npm run dev" --name "demo-sakti-backend-8440"
cd ..

echo "✅ Update Server Berhasil! Aplikasi SAKTI telah diperbarui."
