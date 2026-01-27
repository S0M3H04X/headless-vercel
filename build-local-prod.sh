#!/bin/bash

# Configuration
export ASSET_PREFIX="/assets"
PUBLIC_ASSETS_DIR="./public/assets"

echo "🚀 Starting Local Production Build with Asset Prefix: $ASSET_PREFIX"

# 1. Clean previous assets
echo "🧹 Cleaning up $PUBLIC_ASSETS_DIR..."
rm -rf "$PUBLIC_ASSETS_DIR/_next"

# 2. Build the application
echo "🏗️  Building Next.js application..."
npm run build

# Check if build succeeded
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting."
  exit 1
fi

# 3. Simulate CDN: Copy static assets to public/assets
echo "📦 Copying static assets to $PUBLIC_ASSETS_DIR..."
mkdir -p "$PUBLIC_ASSETS_DIR/_next/static"
cp -r .next/static/* "$PUBLIC_ASSETS_DIR/_next/static/"

echo "✅ Assets prepared at $PUBLIC_ASSETS_DIR/_next/static"

# 4. Start the server
echo "🌍 Starting production server..."
echo "👉 Open http://localhost:3000 to view the app."
echo "ℹ️  Static assets should be served from $ASSET_PREFIX/_next/static/..."

npm start
