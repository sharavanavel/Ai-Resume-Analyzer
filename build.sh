#!/usr/bin/env bash
# Render Build Script
set -e

echo "📦 Installing server dependencies..."
cd server && npm install

echo "📦 Installing client dependencies..."
cd ../client && npm install

echo "🔨 Building React frontend..."
npm run build

echo "✅ Build complete!"
