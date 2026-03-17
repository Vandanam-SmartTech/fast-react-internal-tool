import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const getConfigFile = (mode: string) => {
  console.log("Received mode:", mode);

  const map: Record<string, string> = {
    development: 'config.dev.json',
    staging: 'config.stage.json',
    production: 'config.prod.json',
  };

  return map[mode] ?? 'config.json';
};

export default defineConfig(({ mode }) => {
  const configFile = getConfigFile(mode);

  const configPath = path.resolve(process.cwd(), 'public', configFile);

  if (!fs.existsSync(configPath)) {
    throw new Error(`❌ Config file not found: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf-8');

  if (!raw || raw.trim() === '') {
    throw new Error(`❌ Config file is empty: ${configPath}`);
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Invalid JSON in ${configPath}`);
    throw err;
  }

  console.log('----------------------------------');
  console.log('MODE:', mode);
  console.log('Using config file:', configFile);
  console.log('----------------------------------');

  return {
    base: config.BASE_PATH || '/',
    plugins: [react()],

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios'],
      esbuildOptions: { target: 'es2015' }
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

            if (ext && /png|jpe?g|svg|gif|webp/i.test(ext)) {
              return `assets/img/[name]-[hash][extname]`;
            }
            if (ext && /woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
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
      target: 'es2015',
      reportCompressedSize: false,
      assetsInlineLimit: 4096
    },

    define: {
      global: 'globalThis',

      // ✅ IMPORTANT: pass config file to frontend
      __CONFIG_FILE__: JSON.stringify(configFile)
    },

    server: {
      host: '0.0.0.0',
      port: 8080,
      hmr: {
        protocol: 'ws',
        host: 'localhost'
      }
    }
  };
});