import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadConfig, getConfig } from './config';
import { logPerformance } from './utils/performance';
import { registerSW } from './utils/serviceWorker';

console.log('[SolarPro] Starting application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[SolarPro] Root element not found!');
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

loadConfig()
  .then(() => {
    console.log('[SolarPro] Config loaded successfully');
    const { BASE_PATH } = getConfig();
    console.log('[SolarPro] Base path:', BASE_PATH);
    root.render(<App basePath={BASE_PATH} />);
    console.log('[SolarPro] App rendered');
    logPerformance();
    registerSW();
  })
  .catch((err) => {
    console.error('[SolarPro] Failed to load config:', err);
    root.render(
      <div style={{ 
        fontFamily: 'sans-serif', 
        padding: '40px', 
        maxWidth: '600px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>Configuration Error</h2>
        <p style={{ color: '#374151', marginBottom: '8px' }}>
          Failed to load application configuration.
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Please ensure config.json is accessible at /solarpro/config.json
        </p>
        <pre style={{ 
          background: '#f3f4f6', 
          padding: '12px', 
          borderRadius: '6px',
          fontSize: '12px',
          textAlign: 'left',
          overflow: 'auto',
          marginTop: '16px'
        }}>
          {err?.message || String(err)}
        </pre>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '24px',
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry
        </button>
      </div>
    );
  });

window.addEventListener('error', (event) => {
  console.error('[SolarPro] Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[SolarPro] Unhandled rejection:', event.reason);
});
