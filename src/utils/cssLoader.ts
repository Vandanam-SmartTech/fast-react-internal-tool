export const loadCSS = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    document.head.appendChild(link);
  });
};

export const loadLeafletCSS = () => {
  if (!document.querySelector('link[href*="leaflet"]')) {
    return loadCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
  }
  return Promise.resolve();
};

export const loadCropperCSS = () => {
  if (!document.querySelector('link[href*="react-easy-crop"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/react-easy-crop@5.0.4/react-easy-crop.css';
    document.head.appendChild(link);
  }
};
