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
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'react-leaflet', 'leaflet'],
    exclude: [],
    esbuildOptions: { target: 'es2020' }
  },
  resolve: {
    dedupe: ['react', 'react-dom']
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
            if (id.includes('react-dom') || id.includes('react/') || id.includes('scheduler') || id.includes('react-leaflet')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('axios')) return 'vendor-http';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react-toastify')) return 'vendor-toast';
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('leaflet')) return 'vendor-maps';
            return 'vendor-misc';
          }
          if (id.includes('src/pages/')) {
            const match = id.match(/src\/pages\/([^\/]+)/);
            if (match) return `page-${match[1].toLowerCase()}`;
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
        drop_console: false, 
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.debug'],
        unsafe_arrows: false,
        unsafe_methods: false,
        unsafe_proto: false,
        unsafe_comps: false,
        unsafe_Function: false,
        unsafe_math: false,
        unsafe_symbols: false,
        unsafe_undefined: false,
        booleans_as_integers: false,
        collapse_vars: true,
        comparisons: true,
        computed_props: true,
        conditionals: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        inline: 2,
        join_vars: true,
        keep_fargs: true,
        loops: true,
        properties: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        switches: true,
        unused: true
      },
      format: { 
        comments: false
      },
      mangle: { 
        safari10: true
      }
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
    drop: ['debugger']
  }
});
