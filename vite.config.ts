import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import viteCompression from 'vite-plugin-compression';

const config = JSON.parse(fs.readFileSync('./public/config.json', 'utf-8'));

export default defineConfig({
  base: config.BASE_PATH || '/',
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    viteCompression({ algorithm: 'gzip', threshold: 512, deleteOriginFile: false }),
    viteCompression({ algorithm: 'brotliCompress', threshold: 512, deleteOriginFile: false })
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    exclude: ['react-leaflet', 'leaflet'],
    esbuildOptions: { target: 'es2020' }
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom']
  },
  build: {
    modulePreload: { polyfill: false },
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] || assetInfo.name || 'asset';
          const ext = name.split('.').pop();
          if (ext && /png|jpe?g|svg|gif|webp/i.test(ext)) return `assets/img/[name]-[hash][extname]`;
          if (ext && /woff2?|eot|ttf|otf/i.test(ext)) return `assets/fonts/[name]-[hash][extname]`;
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-react';
            if (id.includes('axios')) return 'vendor-http';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react-toastify')) return 'vendor-toast';
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
          }
          if (id.includes('src/pages/')) {
            const match = id.match(/src\/pages\/([^\/]+)/);
            if (match) return `page-${match[1].toLowerCase()}`;
          }
        }
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: { safari10: true },
      format: { comments: false }
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
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    drop: ['console', 'debugger'],
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  }
});
