import axios, { AxiosInstance } from "axios";
import { jwtDecode } from 'jwt-decode';
import { getConfig } from '../config';

// Singleton instance
let jwtAPIInstance: AxiosInstance | null = null;

// Memory cache
let tokenCache: string | null = null;
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getJwtAPI = (): AxiosInstance => {
  if (jwtAPIInstance) return jwtAPIInstance;

  const { VITE_JWT_API } = getConfig();
  jwtAPIInstance = axios.create({
    baseURL: VITE_JWT_API,
    headers: { 'Content-Type': 'application/json' },
  });

  jwtAPIInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return jwtAPIInstance;
};

export const login = async (credentials: { identifier: string; password: string }) => {
  const response = await getJwtAPI().post('/auth/login', credentials);
  return response.data;
};

export const setAuthToken = (jwt: string, refreshToken: string) => {
  tokenCache = jwt || null;
  if (jwt) {
    localStorage.setItem('jwtToken', jwt);
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
  }
};

export const getAuthToken = (): string | null => {
  if (tokenCache) return tokenCache;
  tokenCache = localStorage.getItem('jwtToken');
  return tokenCache;
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token found");
  
  const response = await getJwtAPI().post("/auth/refresh-token", { refreshToken });
  return response.data;
};

interface JwtClaims {
  sub: string;
  userId?: number;
  username?: string;
  roles?: string[];
  organizationId?: number;
  agencyId?: number;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export const parseJwtClaims = (token: string): JwtClaims | null => {
  try {
    return jwtDecode<JwtClaims>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const claims = parseJwtClaims(token);
  if (!claims?.exp) return true;
  return Date.now() / 1000 >= claims.exp;
};

export const fetchClaims = async () => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    setAuthToken('', '');
    return null;
  }
  return parseJwtClaims(token);
};

// Cached fetch with TTL
const cachedFetch = async <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetcher();
  dataCache.set(key, { data, timestamp: Date.now() });
  return data;
};

export const fetchRepresentatives = async () => {
  return cachedFetch('representatives', async () => {
    const response = await getJwtAPI().get('/api/users/all');
    return response.data.reduce((acc: any[], user: any) => {
      if (user.roles.some((role: any) => role.name === "ROLE_REPRESENTATIVE")) {
        acc.push({
          userId: user.userId,
          name: user.nameAsPerGovId,
          representativeCode: user.representativeCode,
          mobileNumber: user.mobileNumber,
          emailAddress: user.emailAddress
        });
      }
      return acc;
    }, []);
  });
};

export const fetchAdmins = async () => {
  return cachedFetch('admins', async () => {
    const response = await getJwtAPI().get('/api/users/all');
    return response.data.filter((user: any) =>
      user.roles?.some((role: any) => role.name === 'ROLE_SUPER_ADMIN') ||
      user.organizationRoles?.some((orgRole: any) =>
        ['ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN'].includes(orgRole.roleName)
      )
    );
  });
};

export const fetchRegularUsers = async () => {
  const response = await getJwtAPI().get('/api/users/all');
  return response.data.filter(
    (user: any) => !user.roles?.some((role: any) => role.name === 'ROLE_SUPER_ADMIN')
  );
};

export const fetchAllUsers = async () => {
  const response = await getJwtAPI().get('/api/users/all');
  return response.data;
};

export const assignUserRole = async (
  userId: string | number,
  organizationId: string | number,
  roleId: string | number
) => {
  await getJwtAPI().post(
    `/api/users/${userId}/organizations/${organizationId}/roles`,
    parseInt(roleId as string)
  );
  return true;
};

export const validateUser = async (query: string): Promise<string> => {
  const response = await getJwtAPI().post<string>('/auth/valid-user', { query });
  return response.data;
};

export const verifyAndChangePassword = async (
  emailAddress: string,
  newPassword: string
): Promise<void> => {
  await getJwtAPI().post('/auth/update-password', { emailAddress, newPassword });
};

export const validateJwtToken = (): string[] | null => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    setAuthToken('', '');
    return null;
  }
  const claims = parseJwtClaims(token);
  return claims?.roles || null;
};

export const checkMobileNumberExists = async (mobileNumber: string): Promise<boolean> => {
  try {
    const response = await getJwtAPI().get('/api/users/mobile-exist', { params: { mobileNumber } });
    return response.data === true;
  } catch {
    return false;
  }
};

export const checkEmailAddressExists = async (emailAddress: string): Promise<boolean> => {
  try {
    const response = await getJwtAPI().get('/api/users/email-exist', { params: { emailAddress } });
    return response.data === true;
  } catch {
    return false;
  }
};

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const response = await getJwtAPI().get('/api/users/username-exist', { params: { username } });
    return response.data === true;
  } catch {
    return false;
  }
};

export const saveUser = async (data: Record<string, any>) => {
  try {
    const response = await getJwtAPI().post('/api/users', data);
    return response.data.id 
      ? { id: response.data.id, message: 'User data saved successfully!' }
      : { id: null, message: response.data.message || 'Failed to save user data.' };
  } catch {
    return { id: null, message: 'An error occurred while saving user data.' };
  }
};

export const updateUser = async (userId: number, data: Record<string, any>) => {
  try {
    const response = await getJwtAPI().put(`/api/users/${userId}`, data);
    return { id: response.data.userId || null, message: 'User updated successfully!' };
  } catch {
    return { id: null, message: 'An error occurred while updating user data.' };
  }
};

export const deleteUser = async (userId: number) => {
  try {
    const response = await getJwtAPI().delete(`/api/users/${userId}`);
    return { success: true, message: response.data.message || 'User deactivated successfully.' };
  } catch {
    return { success: false, message: 'An error occurred while deactivating the user.' };
  }
};

export const getUserById = async (userId: number) => {
  try {
    const response = await getJwtAPI().get(`/api/users/${userId}`);
    return response.data 
      ? { data: response.data, message: 'User fetched successfully!' }
      : { data: null, message: 'User not found.' };
  } catch {
    return { data: null, message: 'An error occurred while fetching user data.' };
  }
};

export const getUserOrgRolesById = async (userId: number, organizationId: number) => {
  try {
    const response = await getJwtAPI().get(`/api/users/${userId}/organizations/${organizationId}`);
    return response.data
      ? { data: response.data, message: 'User fetched successfully!' }
      : { data: null, message: 'User not found.' };
  } catch {
    return { data: null, message: 'An error occurred while fetching user data.' };
  }
};

export const fetchRepresentativesPaginated = async (page = 0, role?: string) => {
  const params: any = { page };
  if (role) params.role = role;
  
  const response = await getJwtAPI().get('/api/users/paginated/by-role', { params });
  return {
    content: response.data.content,
    totalPages: response.data.totalPages,
    totalElements: response.data.totalElements,
    currentPage: response.data.number,
  };
};

export const fetchDistricts = async () => {
  return cachedFetch('districts', async () => {
    const response = await getJwtAPI().get('/api/district/1');
    return response.data;
  });
};

export const fetchTalukas = async (districtCode: number) => {
  return cachedFetch(`talukas_${districtCode}`, async () => {
    const response = await getJwtAPI().get(`/api/taluka/${districtCode}`);
    return response.data;
  });
};

export const fetchVillages = async (talukaCode: number) => {
  return cachedFetch(`villages_${talukaCode}`, async () => {
    const response = await getJwtAPI().get(`/api/village/${talukaCode}`);
    return response.data;
  });
};

export const getDistrictNameByCode = async (code: number): Promise<string> => {
  try {
    const response = await getJwtAPI().get(`/api/district/name/${code}`, { responseType: 'text' });
    return response.data;
  } catch {
    return 'Unknown District';
  }
};

export const getTalukaNameByCode = async (code: number): Promise<string> => {
  try {
    const response = await getJwtAPI().get(`/api/taluka/name/${code}`, { responseType: 'text' });
    return response.data;
  } catch {
    return 'Unknown Taluka';
  }
};

export const getVillageNameByCode = async (code: number): Promise<string> => {
  try {
    const response = await getJwtAPI().get(`/api/village/name/${code}`, { responseType: 'text' });
    return response.data;
  } catch {
    return 'Unknown Village';
  }
};

export const getAllRoles = async () => {
  return cachedFetch('roles', async () => {
    const response = await getJwtAPI().get('/api/roles');
    return response.data;
  });
};

// Clear cache on logout
export const clearCache = () => {
  dataCache.clear();
  tokenCache = null;
};
