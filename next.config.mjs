/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // 解決 pdfjs-dist 的 canvas 依賴問題
    config.resolve.alias.canvas = false;
    
    // 確保支援 Web Assembly 或 Top Level Await (如果 pdf.js 需要)
    // 注意：Next.js 14 通常預設支援 topLevelAwait，但明確寫出更保險
    // config.experiments = { ...config.experiments, topLevelAwait: true }; 
    
    return config;
  },
  // 避免在開發模式下過於激進的快取導致 Worker 更新失敗
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;