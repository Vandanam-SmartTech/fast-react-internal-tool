import axios from "axios";
// import { getConfig } from '../config';

// const jwtAPI = axios.create({
//   baseURL: getConfig().VITE_JWT_API,
//   headers: { 'Content-Type': 'application/json' },
// });

const jwtAPI = axios.create({
  baseURL: `${import.meta.env.VITE_JWT_API}`,
  headers: { 'Content-Type': 'application/json' },
});


jwtAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials: { username: string; password: string; }) => {
  const response = await jwtAPI.post('/auth/login', credentials);
  return response.data;
};

export const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem('jwtToken', token);
    jwtAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('jwtToken');
    delete jwtAPI.defaults.headers.common['Authorization'];
  }
};



export const getAuthToken = () => localStorage.getItem('jwtToken');


export const fetchClaims = async () => {
  try {
    const response = await jwtAPI.get('/jwt/claims');
    return response.data.claims;
  } catch (error) {
    console.error('Error fetching claims:', error);
    return null;
  }
};

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
    return [];
  }
};

export const validateUser = async (query: string): Promise<string> => {
  const response = await jwtAPI.post<string>('/auth/valid-user', { query });
  return response.data;
};

export const verifyAndChangePassword = async (
  emailAddress: string,
  newPassword: string
): Promise<void> => {
  await jwtAPI.post('/auth/update-password', { emailAddress, newPassword });
};

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

export const saveRepresentative = async (
  data: Record<string, any>
): Promise<{ id: number | null; message?: string }> => {
  try {
    const response = await jwtAPI.post('/api/users', data);
    const responseData = response.data;

    // Extract userId from backend response
    if (responseData.userId) {
      return { id: responseData.userId, message: 'User data saved successfully!' };
    } else {
      return { id: null, message: responseData.message || 'Failed to save user data.' };
    }
  } catch (error: any) {
    console.error('Error details:', error);
    return { id: null, message: 'An error occurred while saving user data.' };
  }
};

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
      return { data: null, message: 'User not found.' };
    }
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return { data: null, message: 'An error occurred while fetching user data.' };
  }
};

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
    throw new Error('Failed to fetch representatives.');
  }
};



export const updateUser = async (userId: number, data: any) => {
  try {
    const response = await jwtAPI.put(`/api/users/${userId}`, data);
    return response;
  } catch (error) {
    console.error("Update failed", error);
    return { message: "Update error" };
  }
};




