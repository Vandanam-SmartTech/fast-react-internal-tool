export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && typeof onPerfEntry === 'function' && typeof window !== 'undefined') {
    // Basic performance metrics without web-vitals dependency
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        onPerfEntry(entry);
      }
    });
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  }
};

export const logPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      if (import.meta.env.DEV) {
        console.log('Performance Metrics:', {
          pageLoadTime: `${pageLoadTime}ms`,
          connectTime: `${connectTime}ms`,
          renderTime: `${renderTime}ms`
        });
      }
    });
  }
};
