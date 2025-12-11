import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'], // 需要建立此檔案引入 @testing-library/jest-dom
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});