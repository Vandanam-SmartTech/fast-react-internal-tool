import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App.tsx';
// import './index.css';
// import { loadConfig } from './config.ts';

// const root = createRoot(document.getElementById('root')!);

// loadConfig()
//   .then(() => {
//     root.render(
//       <StrictMode>
//         <App />
//       </StrictMode>
//     );
//   })
//   .catch((err) => {
//     console.error('Failed to load config:', err);
//     document.body.innerHTML = `<h2 style="color:red;">Failed to load config</h2>`;
//   });
