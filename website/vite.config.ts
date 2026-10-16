import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      omniguard: path.resolve(__dirname, '../src/index.ts'),
    },
  },
  build: {
    rollupOptions: {
      maxParallelFileOps: 128,
    },
  },
});
