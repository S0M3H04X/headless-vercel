#!/bin/bash

# Vercel Build Command
# Use this script in Vercel Project Settings > Build & Development > Build Command

echo "🚀 Starting Vercel Build with Optimized CDN Configuration"

# 1. Set Asset Prefix to match the public/assets structure and rewrite rules
# This ensures Next.js generates asset URLs starting with /assets/_next/...
export ASSET_PREFIX="/assets"

echo "✅ ASSET_PREFIX set to: $ASSET_PREFIX"

# 2. Run standard Next.js build
npm run build
