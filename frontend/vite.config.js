import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/', // GitHub Pages를 위한 절대 경로 설정 (docs 폴더가 루트가 됨)
  server: {
    port: 8080,
  },
  build: {
    outDir: '../docs', // docs 폴더에 직접 빌드
  },
});
