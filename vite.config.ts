import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** 开发时后端地址，可通过环境变量覆盖 */
const apiTarget = process.env.API_TARGET ?? 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // 部署到自定义域名时会被反向代理访问，需放开 host 校验
    allowedHosts: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
  },
});
