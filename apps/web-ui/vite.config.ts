import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 开发环境下将 /api 代理到 NestJS 后端，前端代码只请求 /api/*
      '/api': {
        target: process.env.NEST_BACKEND_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
