import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Environment-based API configuration
const getApiBaseUrl = () => {
  const env = import.meta.env.MODE;
  const customPort = import.meta.env.VITE_API_PORT;
  
  if (env === 'development') {
    return `http://localhost:${customPort || '8080'}`;
  }
  
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
};

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.clear();
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        break;
      case 403:
        toast.error('Access denied. You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 422:
        toast.error('Validation error. Please check your input.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please check your connection.');
        } else {
          toast.error(message || 'An unexpected error occurred.');
        }
    }

    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
}

// Generic API methods
export const apiService = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<T> => {
    try {
      const response = await apiClient.get<T>(url, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.put<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.patch<T>(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Success notification helper
export const showSuccess = (message: string) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Error notification helper
export const showError = (message: string) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Warning notification helper
export const showWarning = (message: string) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Info notification helper
export const showInfo = (message: string) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Loading state hook helper
export const createLoadingState = () => {
  let loading = false;
  let error: string | null = null;

  const setLoading = (isLoading: boolean) => {
    loading = isLoading;
  };

  const setError = (errorMessage: string | null) => {
    error = errorMessage;
  };

  const clearError = () => {
    error = null;
  };

  return {
    loading,
    error,
    setLoading,
    setError,
    clearError,
  };
};

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VALIDATE_USER: '/auth/valid-user',
    UPDATE_PASSWORD: '/auth/update-password',
  },
  
  // JWT
  JWT: {
    CLAIMS: '/jwt/claims',
    VALIDATE: '/jwt/validate',
  },
  
  // Users
  USERS: {
    ALL: '/api/users/all',
    PAGINATED: '/api/users/paginated/by-role',
    BY_ID: (id: number) => `/api/users/${id}`,
    MOBILE_EXIST: '/api/users/mobile-exist',
    EMAIL_EXIST: '/api/users/email-exist',
    USERNAME_EXIST: '/api/users/username-exist',
    CREATE: '/api/users',
    UPDATE: (id: number) => `/api/users/${id}`,
    DELETE: (id: number) => `/api/users/${id}`,
  },
  
  // Organizations
  ORGANIZATIONS: {
    ALL: '/api/organizations',
    BY_ID: (id: number) => `/api/organizations/${id}`,
    CREATE: '/api/organizations',
    UPDATE: (id: number) => `/api/organizations/${id}`,
    DELETE: (id: number) => `/api/organizations/${id}`,
  },
  
  // Agencies
  AGENCIES: {
    BY_ORG: (orgId: number) => `/api/organizations/${orgId}/agencies`,
    BY_ID: (orgId: number, agencyId: number) => `/api/organizations/${orgId}/agencies/${agencyId}`,
    CREATE: (orgId: number) => `/api/organizations/${orgId}/agencies`,
    UPDATE: (orgId: number, agencyId: number) => `/api/organizations/${orgId}/agencies/${agencyId}`,
    DELETE: (orgId: number, agencyId: number) => `/api/organizations/${orgId}/agencies/${agencyId}`,
  },
  
  // Customers
  CUSTOMERS: {
    ALL: '/api/customers',
    PAGINATED: '/api/customers/paginated',
    BY_ID: (id: number) => `/api/customers/${id}`,
    CREATE: '/api/customers',
    UPDATE: (id: number) => `/api/customers/${id}`,
    DELETE: (id: number) => `/api/customers/${id}`,
  },
  
  // Connections
  CONNECTIONS: {
    ALL: '/api/connections',
    BY_ID: (id: number) => `/api/connections/${id}`,
    CREATE: '/api/connections',
    UPDATE: (id: number) => `/api/connections/${id}`,
    DELETE: (id: number) => `/api/connections/${id}`,
  },
  
  // Installations
  INSTALLATIONS: {
    ALL: '/api/installations',
    BY_ID: (id: number) => `/api/installations/${id}`,
    CREATE: '/api/installations',
    UPDATE: (id: number) => `/api/installations/${id}`,
    DELETE: (id: number) => `/api/installations/${id}`,
  },
  
  // Documents
  DOCUMENTS: {
    GENERATE: '/api/documents/generate',
    DOWNLOAD: (id: number) => `/api/documents/${id}/download`,
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    CHARTS: '/api/dashboard/charts',
  },
} as const;

export default apiClient;
