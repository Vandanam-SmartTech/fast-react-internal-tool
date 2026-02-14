export interface AppConfig {
  VITE_JWT_API: string;
  VITE_OTP_API: string;
  VITE_CRS_API: string;
  VITE_QUOTATION_API: string;
  VITE_DOCGENERATOR_API: string;
  VITE_DOCMANAGER_API: string;
  BASE_PATH: string;
  VITE_MODE: string;
  VITE_ENV_LABEL: string;
}

let config: AppConfig | null = null;

export const loadConfig = async (): Promise<void> => {
  try {
    // Try multiple paths to find config.json
    const paths = [
      `${import.meta.env.BASE_URL}config.json`,
      '/solarpro/config.json',
      '/config.json'
    ];
    
    let lastError: Error | null = null;
    
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          config = await response.json();
          console.log('Config loaded from:', path);
          return;
        }
      } catch (err) {
        lastError = err as Error;
      }
    }
    
    throw lastError || new Error('Failed to load config.json from any path');
  } catch (error) {
    console.error('Error loading config.json:', error);
    throw error;
  }
};

export const getConfig = (): AppConfig => {
  if (!config) {
    throw new Error('Config has not been loaded yet');
  }
  return config;
};


