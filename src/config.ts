export interface AppConfig {
  VITE_JWT_API: string;
  VITE_OTP_API: string;
  VITE_CRS_API: string;
  VITE_QUOTATION_API: string;
  VITE_DOCGENERATOR_API: string;
  VITE_DOCMANAGER_API: string;
  VITE_HIRING_API: string;
  BASE_PATH: string;
  VITE_MODE: string;
  VITE_ENV_LABEL: string;
}

let config: AppConfig | null = null;

declare const __CONFIG_FILE__: string;

export const loadConfig = async (): Promise<void> => {
  try {
    console.log("Loading config file:", __CONFIG_FILE__);

    const response = await fetch(
      `${import.meta.env.BASE_URL}${__CONFIG_FILE__}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    config = await response.json();
  } catch (error) {
    console.error('Error loading config:', error);
    throw error;
  }
};

export const getConfig = (): AppConfig => {
  if (!config) {
    throw new Error('Config has not been loaded yet');
  }
  return config;
};


