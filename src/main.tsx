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
      <div style={{ fontFamily: 'sans-serif', padding: 20, color: 'red' }}>
        Failed to load configuration.<br />
        Please refresh the page or contact support.
      </div>
    );
  });
