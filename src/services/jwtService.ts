import axios from "axios";
import { showSuccess, showError } from './apiService';

// Create axios instance with the original configuration
const jwtAPI = axios.create({
  baseURL: `${import.meta.env.VITE_JWT_API}`,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for authentication
jwtAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
// jwtAPI.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     const status = error.response?.status;
//     const message = error.response?.data?.message || error.message;

//     switch (status) {
//       case 401:
//         // Unauthorized - redirect to login
//         localStorage.clear();
//         window.location.href = '/login';
//         showError('Session expired. Please login again.');
//         break;
//       case 403:
//         showError('Access denied. You do not have permission to perform this action.');
//         break;
//       case 404:
//         showError('Resource not found.');
//         break;
//       case 422:
//         showError('Validation error. Please check your input.');
//         break;
//       case 500:
//         showError('Server error. Please try again later.');
//         break;
//       default:
//         if (error.code === 'ECONNABORTED') {
//           showError('Request timeout. Please check your connection.');
//         } else {
//           showError(message || 'An unexpected error occurred.');
//         }
//     }

//     return Promise.reject(error);
//   }
// );

// Login function with enhanced error handling
export const login = async (credentials: { username: string; password: string; }) => {
  const response = await jwtAPI.post('/auth/login', credentials);
  return response.data;
};

// Set authentication token
export const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem('jwtToken', token);
    jwtAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.clear();
    delete jwtAPI.defaults.headers.common['Authorization'];
  }
};

// Get authentication token
export const getAuthToken = () => localStorage.getItem('jwtToken');

// Fetch user claims with enhanced error handling
export const fetchClaims = async () => {
  try {
    const response = await jwtAPI.get('/jwt/claims');
    return response.data.claims;
  } catch (error) {
    console.error('Error fetching claims:', error);
    return null;
  }
};

// Fetch representatives with enhanced error handling
export const fetchRepresentatives = async () => {
  try {
    const response = await jwtAPI.get('/api/users/all');
    return response.data
      .filter((user: { roles: any[] }) => user.roles.some(role => role.name === "ROLE_REPRESENTATIVE"))
      .map((user: {
        userId: any;
        nameAsPerGovId: any;
        representativeCode: any;
        mobileNumber: any;
        emailAddress: any;
      }) => ({
        userId: user.userId,
        name: user.nameAsPerGovId,
        representativeCode: user.representativeCode,
        mobileNumber: user.mobileNumber,
        emailAddress: user.emailAddress
      }));
  } catch (error) {
    console.error("Error fetching representatives:", error);
    showError('Failed to fetch representatives.');
    return [];
  }
};

// Validate user with enhanced error handling
export const validateUser = async (query: string): Promise<string> => {
  try {
    const response = await jwtAPI.post<string>('/auth/valid-user', { query });
    return response.data;
  } catch (error) {
    showError('Failed to validate user.');
    throw error;
  }
};

// Verify and change password with enhanced error handling
export const verifyAndChangePassword = async (
  emailAddress: string,
  newPassword: string
): Promise<void> => {
  try {
    await jwtAPI.post('/auth/update-password', { emailAddress, newPassword });
    showSuccess('Password updated successfully!');
  } catch (error) {
    showError('Failed to update password.');
    throw error;
  }
};

// Validate JWT token with enhanced error handling
export const validateJwtToken = async (): Promise<string[] | null> => {
  try {
    const response = await jwtAPI.get('/jwt/validate');
    return response.data.roles;
  } catch (error) {
    console.error('JWT validation failed:', error);
    localStorage.removeItem('jwtToken');
    return null;
  }
};

// Check mobile number exists with enhanced error handling
export const checkMobileNumberExists = async (
  mobileNumber: string
): Promise<boolean> => {
  try {
    const response = await jwtAPI.get('/api/users/mobile-exist', {
      params: { mobileNumber },
    });
    return response.data === true;
  } catch (error) {
    console.error('Error checking mobile number:', error);
    return false;
  }
};

// Check email address exists with enhanced error handling
export const checkEmailAddressExists = async (
  emailAddress: string
): Promise<boolean> => {
  try {
    const response = await jwtAPI.get('/api/users/email-exist', {
      params: { emailAddress },
    });
    return response.data === true;
  } catch (error) {
    console.error('Error checking email address:', error);
    return false;
  }
};

// Check username exists with enhanced error handling
export const checkUsernameExists = async (
  username: string
): Promise<boolean> => {
  try {
    const response = await jwtAPI.get('/api/users/username-exist', {
      params: { username },
    });
    return response.data === true;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

// Save representative with enhanced error handling
export const saveRepresentative = async (
  data: Record<string, any>
): Promise<{ id: number | null; message?: string }> => {
  try {
    const response = await jwtAPI.post('/api/users', data);
    const responseData = response.data;

    // Extract userId from backend response
    if (responseData.userId) {
      showSuccess('User data saved successfully!');
      return { id: responseData.userId, message: 'User data saved successfully!' };
    } else {
      showError(responseData.message || 'Failed to save user data.');
      return { id: null, message: responseData.message || 'Failed to save user data.' };
    }
  } catch (error: any) {
    console.error('Error details:', error);
    showError('An error occurred while saving user data.');
    return { id: null, message: 'An error occurred while saving user data.' };
  }
};

// Get user by ID with enhanced error handling
export const getUserById = async (
  userId: number
): Promise<{ data: Record<string, any> | null; message?: string }> => {
  try {
    const response = await jwtAPI.get(`/api/users/${userId}`);
    const userData = response.data;
    console.log('User data from API:', userData);

    if (userData) {
      return { data: userData, message: 'User fetched successfully!' };
    } else {
      showError('User not found.');
      return { data: null, message: 'User not found.' };
    }
  } catch (error: any) {
    console.error('Error fetching user:', error);
    showError('An error occurred while fetching user data.');
    return { data: null, message: 'An error occurred while fetching user data.' };
  }
};

// Fetch representatives paginated with enhanced error handling
export const fetchRepresentativesPaginated = async (page = 0, role?: string) => {
  try {
    const params: any = { page };
    if (role) {
      params.role = role;
    }

    const response = await jwtAPI.get('/api/users/paginated/by-role', {
      params,
    });

    return {
      content: response.data.content,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      currentPage: response.data.number,
    };
  } catch (error) {
    console.error('Error fetching representatives:', error);
    showError('Failed to fetch representatives.');
    throw new Error('Failed to fetch representatives.');
  }
};

// Update user with enhanced error handling
export const updateUser = async (userId: number, data: any) => {
  try {
    const response = await jwtAPI.put(`/api/users/${userId}`, data);
    showSuccess('User updated successfully!');
    return response;
  } catch (error) {
    console.error("Update failed", error);
    showError('Failed to update user.');
    return { message: "Update error" };
  }
};




