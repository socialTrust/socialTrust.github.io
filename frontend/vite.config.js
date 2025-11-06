import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: './', // 상대 경로 설정으로 동적 import 경로 문제 해결
  server: {
    port: 8080,
  },
  build: {
    outDir: '../docs', // docs 폴더에 직접 빌드
  },
});
