import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.js',
          dest: '',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      // Ensure pdfjs-dist is properly resolved
      'pdfjs-dist': resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.mjs'),
    },
  },
  optimizeDeps: {
    include: [
      // Include key dependencies for optimization
      'pdfjs-dist',
      'react-pdf',
    ],
    exclude: [
      // Exclude worker files from optimization to avoid issues
      'pdfjs-dist/build/pdf.worker.min.js',
    ],
  },
}); 