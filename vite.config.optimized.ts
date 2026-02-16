import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import viteCompression from 'vite-plugin-compression';

const config = JSON.parse(fs.readFileSync('./public/config.json', 'utf-8'));

export default defineConfig({
  base: config.BASE_PATH || '/',
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip', threshold: 10240 }),
    viteCompression({ algorithm: 'brotliCompress', threshold: 10240 })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('lucide') || id.includes('@heroicons') || id.includes('react-icons')) {
              return 'ui-vendor';
            }
            if (id.includes('datepicker') || id.includes('otp') || id.includes('crop')) {
              return 'form-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('leaflet')) {
              return 'map-vendor';
            }
            if (id.includes('pdf')) {
              return 'pdf-vendor';
            }
            if (id.includes('@mui')) {
              return 'mui-vendor';
            }
            if (id.includes('axios') || id.includes('toastify') || id.includes('date-fns') || id.includes('jwt')) {
              return 'utils';
            }
            return 'vendor';
          }
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
    sourcemap: false,
    reportCompressedSize: false
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
