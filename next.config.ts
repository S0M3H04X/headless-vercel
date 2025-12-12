// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // 忽略 canvas 依賴 (pdf.js 在 Node 環境下需要，但在瀏覽器不需要)
    config.resolve.alias.canvas = false;

    // 確保支援 top-level await (pdf.js 需要)
    config.experiments = { 
        ...config.experiments, 
        topLevelAwait: true 
    };

    return config;
  },
};

export default nextConfig;