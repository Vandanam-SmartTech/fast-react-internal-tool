import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import viteCompression from 'vite-plugin-compression';

const config = JSON.parse(fs.readFileSync('./public/config.json', 'utf-8'));

export default defineConfig({
  base: config.BASE_PATH || '/',
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress' })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@heroicons/react', 'react-icons'],
          'form-vendor': ['react-datepicker', 'react-otp-input', 'react-easy-crop'],
          'chart-vendor': ['recharts'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'pdf-vendor': ['react-pdftotext', 'pdfjs-dist'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'utils': ['axios', 'react-toastify', 'date-fns', 'jwt-decode']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false
  },
  define: {
    global: 'window',
    __DEFINES__: {},
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
});
