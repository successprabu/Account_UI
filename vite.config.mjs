import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 3000, open: true },
  build: {
    outDir: 'build', // the Azure deploy workflow uploads this folder
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    // No manualChunks: splitting React and MUI into separate chunks breaks their load order.
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    include: ['src/**/*.test.{js,jsx}'],
  },
});
