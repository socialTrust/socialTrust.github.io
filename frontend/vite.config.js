import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: './', // GitHub Pages를 위한 상대 경로 설정
  server: {
    port: 8080,
  },
  build: {
    outDir: 'dist',
  },
});
