import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadConfig, getConfig } from './config';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

loadConfig()
  .then(() => {
    const { BASE_PATH } = getConfig();

    root.render(
      <StrictMode>
        <App basePath={BASE_PATH} />
      </StrictMode>
    );
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
