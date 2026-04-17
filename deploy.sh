#!/usr/bin/env sh

# SAKTI - Deployment & Sync Script
# Mengotomatisasi proses build dan pembaruan repositori git

# Abort on errors
set -e

echo "🚀 Memulai proses Deployment SAKTI..."

# 1. Build Project
echo "🏗️ Melakukan build aplikasi (Vite + TypeScript)..."
npm run build

# 2. Git Synchronization
echo "📦 Menyinkronkan perubahan ke Git..."
git add .

# Pastikan ada pesan commit, jika tidak gunakan default
if [ -z "$1" ]
  then
    MESSAGE="deploy: auto-sync $(date +'%Y-%m-%d %H:%M:%S')"
  else
    MESSAGE="$1"
fi

git commit -m "$MESSAGE"

echo "📡 Melakukan Push ke remote repository..."
git push

echo "✅ Proses selesai! SAKTI telah diperbarui."
