import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import viteCompression from 'vite-plugin-compression';

const config = JSON.parse(fs.readFileSync('./public/config.json', 'utf-8'));

export default defineConfig({
  base: config.BASE_PATH || '/',
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip', threshold: 512, deleteOriginFile: false }),
    viteCompression({ algorithm: 'brotliCompress', threshold: 512, deleteOriginFile: false })
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    exclude: [],
    esbuildOptions: { target: 'es2020' }
  },
  build: {
    modulePreload: { polyfill: false },
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop();
          if (/png|jpe?g|svg|gif|webp/i.test(ext)) return `assets/img/[name]-[hash][extname]`;
          if (/woff2?|eot|ttf|otf/i.test(ext)) return `assets/fonts/[name]-[hash][extname]`;
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'react';
            if (id.includes('react/') || id.includes('scheduler')) return 'react';
            if (id.includes('react-router')) return 'router';
            if (id.includes('react-icons') || id.includes('lucide-react')) return 'icons';
            if (id.includes('react-toastify')) return 'toast';
            if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'charts';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'maps';
            if (id.includes('react-easy-crop') || id.includes('cropperjs')) return 'crop';
            if (id.includes('axios')) return 'http';
            if (id.includes('sockjs') || id.includes('stomp')) return 'ws';
          }
        }
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: { 
        drop_console: true, 
        drop_debugger: true,
        passes: 3,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true
      },
      format: { comments: false },
      mangle: { safari10: true }
    },
    chunkSizeWarningLimit: 250,
    sourcemap: false,
    target: 'es2020',
    reportCompressedSize: false,
    assetsInlineLimit: 4096
  },
  define: {
    global: 'globalThis'
  },
  server: { 
    host: '0.0.0.0', 
    port: 8080,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    drop: ['console', 'debugger']
  }
});
