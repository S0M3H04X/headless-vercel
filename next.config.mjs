/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    const apiRewrites = [
      {
        source: '/api/python/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/api/python/:path*' // 本地開發時指向 Python Server
            : '/api/index.py', // 生產環境交給 Vercel 處理
      },
    ];

    // If simulating CDN with ASSET_PREFIX, rewrite root asset requests to the prefix path
    if (process.env.ASSET_PREFIX) {
      return [
        ...apiRewrites,
        { source: '/fonts/:path*', destination: `${process.env.ASSET_PREFIX}/fonts/:path*` },
        { source: '/icons/:path*', destination: `${process.env.ASSET_PREFIX}/icons/:path*` },
        { source: '/img/:path*', destination: `${process.env.ASSET_PREFIX}/img/:path*` },
        { source: '/pdf/:path*', destination: `${process.env.ASSET_PREFIX}/pdf/:path*` },
        { source: '/classicy/:path*', destination: `${process.env.ASSET_PREFIX}/classicy/:path*` },
      ];
    }

    return apiRewrites;
  },
  assetPrefix: process.env.ASSET_PREFIX || undefined,
  webpack: (config, { dev, isServer, webpack }) => {
    // 1. 基礎設定：解決 Canvas 依賴與 Top Level Await
    config.resolve.alias.canvas = false;
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true
    };

    // 2. Shader file support (glslify)
    config.module.rules.push({
      test: /\.(glsl|vert|frag|wgsl)$/,
      use: ['raw-loader', 'glslify-loader'],
    });

    // 2. [核心修復] 僅在開發模式下 (dev) 且在客戶端 (Client-side) 應用此修正
    if (dev && !isServer) {
      // (A) 重要：先關閉 Next.js 預設的 devtool，交由 Plugin 接管
      config.devtool = false;

      // (B) 注入您提供的修復
      config.plugins.push(
        new webpack.EvalSourceMapDevToolPlugin({
          // 這是 Next.js 預設 eval-source-map 的優化版設定
          modules: true,
          columns: false, // 關閉行內映射以提升效能

          // [關鍵] 排除 pdfjs-dist，讓它保持原始代碼結構，不被 eval 包裹
          // 這樣 Worker 才能正確解析路徑，且不會撐爆記憶體
          exclude: [/node_modules\/pdfjs-dist/],
        })
      );
    }

    return config;
  },
  // 保持開發體驗流暢的快取設定
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;