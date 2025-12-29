import { defineConfig, configDefaults } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      // 1. [修正] 讓 Vitest 看得懂 '@/' 指向 './app/'
      '@': path.resolve(__dirname, './app'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true, // 允許使用 describe, it, expect 而不用每次 import

    // [新增] 載入 .env.local 中的環境變數
    env: loadEnv(mode, process.cwd(), ''),

    // 2. [修正] 排除 Playwright 的 E2E 測試檔案
    exclude: [
      ...configDefaults.exclude,
      'tests/pdf-worker.spec.ts',
      'tests/example.spec.ts',
      'tests/e2e/**' // 建議未來將 E2E 測試都放在這裡
    ],
  },
}));