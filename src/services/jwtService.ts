import axios from "axios";

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
