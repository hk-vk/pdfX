import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Get the path to the pdf.worker file
const pdfjsDistPath = resolve(require.resolve('pdfjs-dist/package.json'), '..');
const workerFile = resolve(pdfjsDistPath, 'build/pdf.worker.min.js');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: workerFile,
          dest: '', // Will copy to the root of the build directory
        },
      ],
      structured: false,
    }),
  ],
  resolve: {
    alias: {
      // Ensure pdfjs-dist is properly resolved
      'pdfjs-dist': resolve(pdfjsDistPath, 'build/pdf.mjs'),
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