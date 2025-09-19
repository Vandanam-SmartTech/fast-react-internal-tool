import axios from "axios";
import { getConfig } from '../config';

export const getJwtAPI = () => {
  const { VITE_JWT_API } = getConfig();

  const jwtAPI = axios.create({
    baseURL: VITE_JWT_API,
    headers: { 'Content-Type': 'application/json' },
  });

  jwtAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return jwtAPI;
};

export const login = async (credentials: { identifier: string; password: string; }) => {
  const jwtAPI = getJwtAPI();
  const response = await jwtAPI.post('/auth/login', credentials);
  return response.data;
};

export const setAuthToken = (token: string) => {
  const jwtAPI = getJwtAPI();
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
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get('/jwt/claims');
    return response.data.claims;
  } catch (error) {
    console.error('Error fetching claims:', error);
    return null;
  }
};


export const fetchRepresentatives = async () => {
  const jwtAPI = getJwtAPI();
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

export const fetchAdmins = async () => {
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get('/api/users/all');

    return response.data.filter((user: any) =>
      user.roles?.some((role: any) => role.name === 'ROLE_SUPER_ADMIN') ||
      user.organizationRoles?.some((orgRole: any) =>
        ['ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN'].includes(orgRole.roleName)
      )
    );
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
};

export const fetchRegularUsers = async () => {
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get('/api/users/all');

    return response.data.filter(
      (user: any) => !user.roles?.some((role: any) => role.name === 'ROLE_SUPER_ADMIN')
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchAllUsers = async () => {
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get('/api/users/all');
    return response.data; 
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const assignUserRole = async (
  userId: string | number,
  organizationId: string | number,
  roleId: string | number
) => {
  const jwtAPI = getJwtAPI();
  try {
    await jwtAPI.post(
      `/api/users/${userId}/organizations/${organizationId}/roles`,
      parseInt(roleId as string)
    );
    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    throw error;
  }
};

export const validateUser = async (query: string): Promise<string> => {
  const jwtAPI = getJwtAPI();
  const response = await jwtAPI.post<string>('/auth/valid-user', { query });
  return response.data;
};

export const verifyAndChangePassword = async (
  emailAddress: string,
  newPassword: string
): Promise<void> => {
  const jwtAPI = getJwtAPI();
  await jwtAPI.post('/auth/update-password', { emailAddress, newPassword });
};

export const validateJwtToken = async (): Promise<string[] | null> => {
  const jwtAPI = getJwtAPI();
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
  const jwtAPI = getJwtAPI();
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
  const jwtAPI = getJwtAPI();
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
    const jwtAPI = getJwtAPI();
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
  const jwtAPI = getJwtAPI();
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
  const jwtAPI = getJwtAPI();
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
  const jwtAPI = getJwtAPI();
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
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.put(`/api/users/${userId}`, data);
    return response;
  } catch (error) {
    console.error("Update failed", error);
    return { message: "Update error" };
  }
};

export const fetchDistricts = async (): Promise<District[]> => {
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get('/api/district/27');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching districts:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch districts'
    );
  }
};

export const fetchTalukas = async (districtCode: number): Promise<Taluka[]> => {
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get(`/api/taluka/${districtCode}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching talukas:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch talukas'
    );
  }
};

export const fetchVillages = async (talukaCode: number): Promise<Village[]> => {
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get(`/api/village/${talukaCode}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching villages:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch villages'
    );
  }
};

export const getDistrictNameByCode = async (code: number): Promise<string> => {
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get(`/api/district/name/${code}`, {
      responseType: 'text', 
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching district name:', error);
    return 'Unknown District'; 
  }
};

export const getTalukaNameByCode = async (code: number): Promise<string> => {
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get(`/api/taluka/name/${code}`, {
      responseType: 'text', 
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching taluka name:', error);
    return 'Unknown Taluka';
  }
};

export const getVillageNameByCode = async (code: number): Promise<string> => {
  const jwtAPI = getJwtAPI();
  try {
    const response = await jwtAPI.get(`/api/village/name/${code}`, {
      responseType: 'text', 
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching village name:', error);
    return 'Unknown Village'; 
  }
};




