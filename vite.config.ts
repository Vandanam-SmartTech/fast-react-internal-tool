import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
 
// https://vitejs.dev/config/
export default defineConfig({
  base: '/SolarPro/', // Required for sub-path hosting
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'window',
  },
  server: {
    host: '0.0.0.0',
    port: 8123,
  },
});