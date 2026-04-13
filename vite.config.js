import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: 'index.html',
        live: 'live.html',
      },
    },
  },
  server: {
    port: 3001,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Prefer .tsx/.ts over .jsx/.js so TypeScript files shadow old shims during migration
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
});
