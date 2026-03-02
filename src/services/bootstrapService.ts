import { getJwtAPI } from './jwtService';

export interface BootstrapResponse {
  // For SUPER_ADMIN
  users?: any[];
  organizations?: any[];

  // For ORG_ADMIN/AGENCY_ADMIN
  usersPaginated?: {
    content: any[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };

  // Filtered results
  filteredUsers?: any[];

  // Stats (for all roles)
  totalUsers?: number;
  activeUsers?: number;
  inactiveUsers?: number;
  filteredCount?: number;

  // For all roles (from JWT claims)
  roles?: Array<{ name: string }>;
}

export const fetchBootstrapData = async (
  page = 0,
  size = 9,
  status?: string,
  roles?: string,
  search?: string
): Promise<BootstrapResponse> => {
  const params: any = { page, size };

  // Map status to statuses parameter
  if (status === 'active') params.statuses = 'ACTIVE';
  if (status === 'inactive') params.statuses = 'INACTIVE';
  // For 'all', send both or omit the parameter
  if (status === 'all') params.statuses = 'ACTIVE,INACTIVE';

  if (roles && roles !== 'all') params.roles = roles;
  if (search) params.search = search;

  const response = await getJwtAPI().get('/api/bootstrap', { params });
  return response.data;
};
