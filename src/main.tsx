import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadConfig, getConfig } from './config';
import { logPerformance } from './utils/performance';
import { registerSW } from './utils/serviceWorker';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

loadConfig()
  .then(() => {
    const { BASE_PATH } = getConfig();
    root.render(<App basePath={BASE_PATH} />);
    logPerformance();
    registerSW();
  })
  .catch((err) => {
    console.error('Failed to load config.json:', err);
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
