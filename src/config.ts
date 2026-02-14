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
    const response = await fetch('/solarpro/config.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    config = await response.json();
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


