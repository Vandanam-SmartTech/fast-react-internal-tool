import axios from "axios";

const orgAPI = axios.create({
  baseURL: `${import.meta.env.VITE_JWT_API}`,
  headers: { 'Content-Type': 'application/json' },
});

orgAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Organization {
  id?: number;
  name: string;
  displayName?: string;
  legalName?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  stateCode?: number;
  districtCode?: number;
  talukaCode?: number;
  villageCode?: number;
  contactNumber?: string;
  logoUrl?: string;
  gstNumber?: string;
  govtRegNumber?: string;
  parentId?: number;
  createdBy?: number;
  createdAt?: string;
}

export const fetchOrganizations = async (): Promise<Organization[]> => {
  const response = await orgAPI.get('/api/organizations');
  return response.data;
};

export const createOrganization = async (org: Organization): Promise<Organization> => {
  try {
    const response = await orgAPI.post('/api/organizations', org);
    return response.data;
  } catch (error: any) {
    console.error('Create organization error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateOrganization = async (id: number, org: Organization): Promise<Organization> => {
  const response = await orgAPI.put(`/api/organizations/${id}`, org);
  return response.data;
};

export const deleteOrganization = async (id: number): Promise<void> => {
  await orgAPI.delete(`/api/organizations/${id}`);
};

export const getOrganizationById = async (id: number): Promise<Organization> => {
  const response = await orgAPI.get(`/api/organizations/${id}`);
  return response.data;
};

export const getChildOrganizations = async (parentId: number): Promise<Organization[]> => {
  const response = await orgAPI.get(`/api/organizations/${parentId}/children`);
  return response.data;
};

export const createAdminUser = async (userData: any): Promise<any> => {
  const response = await orgAPI.post('/api/users', userData);
  return response.data;
};

export const createAgencyAdmin = async (userData: any): Promise<any> => {
  const response = await orgAPI.post('/api/users', {
    ...userData,
    roleIds: [3] // Assuming role ID 3 is for AGENCY_ADMIN
  });
  return response.data;
};