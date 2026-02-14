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
            if (id.includes('react-dom')) return 'vendor-react';
            if (id.includes('react/') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react-toastify')) return 'vendor-toast';
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
            if (id.includes('leaflet')) return 'vendor-maps';
            if (id.includes('axios')) return 'vendor-http';
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
        drop_console: true, 
        drop_debugger: true,
        passes: 5,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_undefined: true,
        booleans_as_integers: true,
        collapse_vars: true,
        comparisons: true,
        computed_props: true,
        conditionals: true,
        dead_code: true,
        directives: true,
        evaluate: true,
        hoist_funs: true,
        hoist_props: true,
        hoist_vars: true,
        if_return: true,
        inline: 3,
        join_vars: true,
        keep_fargs: false,
        loops: true,
        negate_iife: true,
        properties: true,
        reduce_funcs: true,
        reduce_vars: true,
        sequences: true,
        side_effects: true,
        switches: true,
        toplevel: true,
        typeofs: true,
        unused: true
      },
      format: { 
        comments: false,
        ascii_only: true,
        beautify: false,
        braces: false,
        ecma: 2020
      },
      mangle: { 
        safari10: true,
        toplevel: true,
        eval: true,
        properties: {
          regex: /^_/
        }
      },
      module: true,
      toplevel: true
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
