// src/config.ts
export interface AppConfig {
  VITE_JWT_API: string;
  VITE_OTP_API: string;
  VITE_CRS_API: string;
  VITE_QUOTATION_API: string;
  VITE_DOCUMENT_API: string;
  VITE_ONEDRIVE_API: string;
  VITE_MODE: string;
  VITE_ENV_LABEL: string;
}

let config: AppConfig | null = null;

export const loadConfig = async (): Promise<void> => {
  if (config !== null) return; 

  const response = await fetch('/config.json');
  if (!response.ok) {
    throw new Error('Failed to load config.json');
  }

  config = await response.json();
};

export const getConfig = (): AppConfig => {
  if (!config) {
    throw new Error('Config not loaded yet');
  }
  return config;
};
