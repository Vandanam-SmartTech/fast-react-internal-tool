import axios from 'axios';

const roleAPI = axios.create({
  baseURL: `${import.meta.env.VITE_JWT_API}/api/roles`,
  headers: { 'Content-Type': 'application/json' },
});

roleAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface RoleDto {
  id?: number;
  name: string;
}

export const getAllRoles = async (): Promise<RoleDto[]> => {
  const response = await roleAPI.get('');
  return response.data;
};

export const getRoleById = async (id: number): Promise<RoleDto> => {
  const response = await roleAPI.get(`/${id}`);
  return response.data;
};

export const createRole = async (role: RoleDto): Promise<RoleDto> => {
  const response = await roleAPI.post('', role);
  return response.data;
};

export const updateRole = async (id: number, role: RoleDto): Promise<RoleDto> => {
  const response = await roleAPI.put(`/${id}`, role);
  return response.data;
};

export const deleteRole = async (id: number): Promise<void> => {
  await roleAPI.delete(`/${id}`);
};