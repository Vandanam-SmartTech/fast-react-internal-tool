import axios from 'axios';
import { getAuthToken } from './jwtService';
import { getConfig } from '../config';

export const getRoleAPI = () => {
  const { VITE_JWT_API } = getConfig();

  const roleAPI = axios.create({
    baseURL: VITE_JWT_API,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  roleAPI.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return roleAPI;
};


export interface RoleDto {
  id?: number;
  name: string;
}

export const getAllRoles = async (): Promise<RoleDto[]> => {
  const roleAPI = getRoleAPI();
  const response = await roleAPI.get('/api/roles');
  return response.data;
};

export const getRoleById = async (id: number): Promise<RoleDto> => {
  const roleAPI = getRoleAPI();
  const response = await roleAPI.get(`/api/roles/${id}`);
  return response.data;
};

export const createRole = async (role: RoleDto): Promise<RoleDto> => {
  const roleAPI = getRoleAPI();
  const response = await roleAPI.post('/api/roles', role);
  return response.data;
};

export const updateRole = async (id: number, role: RoleDto): Promise<RoleDto> => {
  const roleAPI = getRoleAPI();
  const response = await roleAPI.put(`/api/roles/${id}`, role);
  return response.data;
};

export const deleteRole = async (id: number): Promise<void> => {
  const roleAPI = getRoleAPI();
  await roleAPI.delete(`/api/roles/${id}`);
};