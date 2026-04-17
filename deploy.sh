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

# 3. Build for production
echo "🏗️ Membangun ulang aplikasi (Production Build)..."
npm run build

echo "✅ Update Server Berhasil! Aplikasi SAKTI telah diperbarui."
