import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic', // fixes React is not defined
    }),
  ],
  base: './', // makes assets load correctly in dist
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
