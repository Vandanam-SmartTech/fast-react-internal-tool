import axios from "axios";
import { getConfig } from '../config';
import { getAuthToken } from './jwtService';


export const getOrgAPI = () => {
  const { VITE_JWT_API } = getConfig();

  const orgAPI = axios.create({
    baseURL: VITE_JWT_API,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  orgAPI.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return orgAPI;
};

export interface Organization {
  id?: number;
  name: string;
  displayName?: string;
  legalName?: string;
  addressLine1?: string;
  addressLine2?: string;
  pinCode?: number;
  villageCode?: number;
  villageName?: string;
  talukaCode?: number;
  talukaName?: string;
  districtCode?: number;
  districtName?: string;
  contactNumber?: string;
  logoUrl?: string;
  gstNumber?: string;
  govtRegNumber?: string;
  parentId?: number;
  createdBy?: number;
  createdAt?: string;
}

export const fetchOrganizations = async (): Promise<Organization[]> => {
  const orgAPI = getOrgAPI();
  const response = await orgAPI.get('/api/organizations');
  return response.data;
};

export const createOrganization = async (org: Organization): Promise<Organization> => {
  const orgAPI = getOrgAPI();
  try {
    const response = await orgAPI.post('/api/organizations', org);
    return response.data;
  } catch (error: any) {
    console.error('Create organization error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateOrganization = async (id: number, org: Organization): Promise<Organization> => {
  const orgAPI = getOrgAPI();
  const response = await orgAPI.put(`/api/organizations/${id}`, org);
  return response.data;
};

export const deleteOrganization = async (id: number): Promise<void> => {
  const orgAPI = getOrgAPI();
  await orgAPI.delete(`/api/organizations/${id}`);
};

export const getOrganizationById = async (id: number): Promise<Organization> => {
  const orgAPI = getOrgAPI();
  const response = await orgAPI.get(`/api/organizations/${id}`);
  return response.data;
};

export const getChildOrganizations = async (parentId: number): Promise<Organization[]> => {
  const orgAPI = getOrgAPI();
  const response = await orgAPI.get(`/api/organizations/${parentId}/children`);
  return response.data;
};

export const createAdminUser = async (userData: any): Promise<any> => {
  const orgAPI = getOrgAPI();
  const response = await orgAPI.post('/api/users', userData);
  return response.data;
};

export const createAgencyAdmin = async (userData: any): Promise<any> => {
  const orgAPI = getOrgAPI();
  const response = await orgAPI.post('/api/users', {
    ...userData,
    roleIds: [3] // Assuming role ID 3 is for AGENCY_ADMIN
  });
  return response.data;
};

export const getUserRolesForOrganization = async (userId: number, orgId: number): Promise<any[]> => {
  const orgAPI = getOrgAPI();
  const response = await orgAPI.get(`/api/users/${userId}/organizations/${orgId}/roles`);
  return response.data;
};


export const getUserRolesWithAgencies = async (userId: number, organizations: Organization[]): Promise<string[]> => {
  const roles: string[] = [];

  for (const org of organizations) {
    try {
      const orgRoles = await getUserRolesForOrganization(userId, org.id!);
      orgRoles.forEach((role) => {
        if (['ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN'].includes(role.name)) {
          roles.push(`${role.name.replace('ROLE_', '')} (${org.name})`);
        }
      });
    } catch (error) {
      console.error('Error loading roles for org', org.id, error);
    }

    try {
      const agencies = await getChildOrganizations(org.id!);
      for (const agency of agencies) {
        try {
          const agencyRoles = await getUserRolesForOrganization(userId, agency.id!);
          agencyRoles.forEach((role) => {
            if (['ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN'].includes(role.name)) {
              roles.push(`${role.name.replace('ROLE_', '')} (${agency.name})`);
            }
          });
        } catch (error) {
          console.error('Error loading roles for agency', agency.id, error);
        }
      }
    } catch (error) {
      console.error('Error loading agencies for org', org.id, error);
    }
  }

  return roles;
};


export interface OrganizationUser {
  id: number;
  username: string;
  nameAsPerGovId: string;
  emailAddress: string;
  contactNumber: string;
  organizationRoles: Array<{
    organizationId: number;
    organizationName: string;
    roleId: number;
    roleName: string;
  }>;
}

export const fetchOrganizationUsers = async (orgId: number): Promise<OrganizationUser[]> => {
  const orgAPI = getOrgAPI();
  try {
    const response = await orgAPI.get<OrganizationUser[]>('/api/users/all');

    return response.data.filter(user =>
      user.organizationRoles?.some(role => role.organizationId === orgId)
    );
  } catch (error: any) {
    console.error('Error fetching organization users:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchUserRolesByOrganization = async (userId: number, organizations: { id: number; name: string }[]) => {
  const orgAPI = getOrgAPI();

  const rolesByOrg = await Promise.all(
    organizations.map(async (org) => {
      try {
        const { data: orgRoles } = await orgAPI.get(`/api/users/${userId}/organizations/${org.id}/roles`);
        if (orgRoles.length > 0) {
          return {
            org: org.name,
            roles: orgRoles.map((role: any) => role.name.replace('ROLE_', ''))
          };
        }
        return null;
      } catch (error) {
        console.error(`Error loading roles for org ${org.id}:`, error);
        return null;
      }
    })
  );

  return rolesByOrg.filter((entry): entry is { org: string; roles: string[] } => entry !== null);
};

export const fetchRolesForOrg = async (userId: number, orgId: number, orgName: string) => {
  const orgAPI = getOrgAPI();
  try {
    const { data: roles } = await orgAPI.get(`/api/users/${userId}/organizations/${orgId}/roles`);
    return roles.map((role: any) => `${role.name.replace('ROLE_', '')} (${orgName})`);
  } catch (error) {
    console.error(`Error loading roles for org ${orgId}:`, error);
    return [];
  }
};

export const fetchAgenciesForOrg = async (orgId: number) => {
  const orgAPI = getOrgAPI();
  try {
    const { data } = await orgAPI.get(`/api/organizations/${orgId}/children`);
    return data;
  } catch (error) {
    console.error(`Error loading agencies for org ${orgId}:`, error);
    return [];
  }
};

export const fetchAllUserRoles = async (
  userId: number,
  organizations: { id?: number; name: string }[]
) => {
  const allRoles: string[] = [];

  await Promise.all(
    organizations.map(async (org) => {
      if (!org.id) return; 

      const orgRoles = await fetchRolesForOrg(userId, org.id, org.name);
      allRoles.push(...orgRoles);

      const agencies = await fetchAgenciesForOrg(org.id);
      const agencyRolesResults = await Promise.all(
        agencies.map((agency: any) => fetchRolesForOrg(userId, agency.id, agency.name))
      );
      agencyRolesResults.forEach((roles) => allRoles.push(...roles));
    })
  );

  return allRoles;
};

export interface UserOrgRole {
  organizationId: number;
  organizationName: string;
  roles: any[];
}

export const fetchUserOrgRoles = async (userId: number, organizations: { id?: number; name: string }[]) => {
  const orgAPI = getOrgAPI();
  const orgRoles: UserOrgRole[] = [];

  for (const org of organizations) {
    if (!org.id) continue; // Skip if ID is missing

    try {
      const { data: roles } = await orgAPI.get(`/api/users/${userId}/organizations/${org.id}/roles`);
      if (roles.length > 0) {
        orgRoles.push({
          organizationId: org.id,
          organizationName: org.name,
          roles
        });
      }
    } catch (error) {
      console.error(`Failed to load roles for org ${org.id}`, error);
    }
  }

  return orgRoles;
};

export const assignUserOrgRole = async (
  userId: number,
  organizationId: number,
  roleId: number
): Promise<void> => {
  const orgAPI = getOrgAPI();
  await orgAPI.post(
    `/api/users/${userId}/organizations/${organizationId}/roles`,
    roleId
  );
};

export const removeUserOrgRole = async (
  userId: number,
  organizationId: number,
  roleId: number
): Promise<void> => {
  const orgAPI = getOrgAPI();
  await orgAPI.delete(
    `/api/users/${userId}/organizations/${organizationId}/roles/${roleId}`
  );
};

export const assignMultipleUserOrgRoles = async (
  userId: number,
  organizationId: number,
  roleIds: number[]
): Promise<void> => {
  const orgAPI = getOrgAPI();

  await Promise.all(
    roleIds.map((roleId) =>
      orgAPI.post(
        `/api/users/${userId}/organizations/${organizationId}/roles`,
        roleId
      )
    )
  );
};

export const fetchUsersByOrgId = async (organizationId: string | number) => {
  const orgAPI = getOrgAPI();
  try {
    const response = await orgAPI.get(
      `/api/users/organizations/${organizationId}/users`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch organization and agency users:", error);
    throw error;
  }
};

export const fetchAllUsersByOrgId = async (organizationId: string | number) => {
  const orgAPI = getOrgAPI();
  try {
    const response = await orgAPI.get(
      `/api/users/getAllUsers/organizations/${organizationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch organization users:", error);
    throw error;
  }
};

export const fetchOrganizationsInPagination = async (page = 0) => {
  const orgAPI = getOrgAPI();
  try {
    const response = await orgAPI.get('/api/organizations/getAll/paginated', {
      params: { page },
    });

    return {
      content: response.data.content,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      currentPage: response.data.number,
      size: response.data.size,
    };
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw new Error('Failed to fetch organizations.');
  }
};

export const getChildOrganizationsInPagination = async (parentId: number, page = 0) => {
  const orgAPI = getOrgAPI();
  try {
    const response = await orgAPI.get(`/api/organizations/${parentId}/child-org/paginated`, {
      params: { page },
    });

    return {
      content: response.data.content,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      currentPage: response.data.number,
      size: response.data.size,
    };
  } catch (error) {
    console.error(`Error fetching child organizations for parentId ${parentId}:`, error);
    throw new Error('Failed to fetch child organizations.');
  }
};

export const getParentDetails = async (orgId: string | number) => {
  const orgAPI = getOrgAPI();
  try {
    const response = await orgAPI.get(`/api/organizations/parentDetails/${orgId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch organization parent details:", error);
    throw error;
  }
};

