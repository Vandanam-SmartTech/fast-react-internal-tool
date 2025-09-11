import axios from 'axios';
import { getAuthToken } from './jwtService';
import { getConfig } from '../config';

export const getCrsAPI = () => {
  const { VITE_CRS_API } = getConfig();

  const crsAPI = axios.create({
    baseURL: VITE_CRS_API,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  crsAPI.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return crsAPI;
};


export const saveCustomer = async (data: Record<string, any>): Promise<{ id: number | null, message?: string }> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.post('/api/customers', data);
    const responseData = response.data;

    if (responseData.id) {
      return { id: responseData.id, message: 'Customer data saved successfully!' };
    } else {
      return { id: null, message: responseData.message || 'Failed to save customer data.' };
    }
  } catch (error: any) {
    console.error('Error details:', error);
    return { id: null, message: 'An error occurred while saving customer data.' };
  }
};

// Check if mobile number exists
export const checkMobileNumberExists = async (
  mobileNumber: string
): Promise<boolean> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get('/api/customers/mobile-exist', {
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
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get('/api/customers/email-exist', {
      params: { emailAddress },
    });

    return response.data === true;
  } catch (error) {
    console.error('Error checking email address:', error);
    return false;
  }
};

export const checkConsumerNumberExists = async (
  consumerId: string
): Promise<boolean> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get('/api/connections/consumerId-exist', {
      params: { consumerId },
    });

    return response.data === true;
  } catch (error) {
    console.error('Error checking consumer number:', error);
    return false;
  }
};

export const saveConnection = async (
  data: Record<string, any>
): Promise<{ id: number | null; message?: string }> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.post('/api/connections', data);


    const responseData = response.data;
    console.log('API response data:', responseData);

    if (responseData.id) {
      return { id: responseData.id, message: 'Connection data saved successfully' };
    } else {
      return {
        id: null,
        message: responseData.message || 'Failed to save connection data.',
      };
    }
  } catch (error: any) {
    console.error('Error details:', error);
    return {
      id: null,
      message:
        error?.response?.data?.message ||
        'An error occurred while saving connection data',
    };
  }
};


export const saveInstallation = async (data: Record<string, any>): Promise<{ id: number | null, message?: string }> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.post('/api/installations', data);

    
    const responseData = await response.data;
    console.log('API response data:', responseData); 

    
    if (responseData.id) {

      return { id: responseData.id, message: 'Installation data saved successfully! '};
    } else {

      return { id: null, message: responseData.message || 'Failed to save installation data. '};
    }
  } catch (error: any) {

    console.error('Error details:', error);

    return { id: null, message: 'An error occurred while saving installation data. '};
  }
};


export const fetchDistricts = async (): Promise<District[]> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get('/api/district/27');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching districts:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch districts'
    );
  }
};

export const fetchTalukas = async (districtCode: number): Promise<Taluka[]> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/taluka/${districtCode}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching talukas:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch talukas'
    );
  }
};

export const fetchVillages = async (talukaCode: number): Promise<Village[]> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/village/${talukaCode}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching villages:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch villages'
    );
  }
};

export const fetchConnectionType = async (): Promise<{ id: number; nameEn: string }[]> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get('/api/connectionType');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching connection types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch connection types'
    );
  }
};

export const fetchPhaseType = async (): Promise<{ id: number; nameEn: string }[]> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get('/api/phaseType');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching phase types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch phase types'
    );
  }
};

export const fetchAddressType = async (): Promise<{ id: number; nameEn: string }[]> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get('/api/addressType');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching address types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch address types'
    );
  }
};

export const fetchCorrectionType = async (): Promise<{ id: number; nameEn: string }[]> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get('/api/correctionType');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching correction types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch correction types'
    );
  }
};

export const fetchInstallationSpaceTypesNames = async (): Promise<{ id: number; nameEnglish: string }[]> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get('/api/installationSpaceTypes');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching correction types:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch correction types'
    );
  }
};



export const fetchInstallationSpaceTypes = async (
  connectionId: number
): Promise<number[]> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/installations/${connectionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching installation space types:', error);
    return [];
  }
};

export const getCustomerById = async (customerId: number): Promise<any> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/customers/${customerId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customer details:', error);
    return null;
  }
};

// export const getCustomerWithConnections = async (customerId: number): Promise<any> => {
//   const crsAPI = getCrsAPI();
//   try {
//     const orgId = localStorage.getItem('selectedOrganization');
//     const orgName = localStorage.getItem('selectedOrganizationName');
//     const agencyId = localStorage.getItem('selectedAgency');
//     const agencyName = localStorage.getItem('selectedAgencyName');
    
//     console.log('CRS API Parameters for getCustomerWithConnections:', { orgId, orgName, agencyId, agencyName, customerId });
    
//     const response = await crsAPI.get(`/api/customers/${customerId}/with-connections`, {
//       params: { orgId, orgName, agencyId, agencyName }
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error('Error fetching customer details:', error);
//     return null;
//   }
// };

export const getConnectionByConnectionId = async (connectionId: number): Promise<any> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/connections/${connectionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching connection details:', error);
    return null;
  }
};

export const getInstallationByConnectionId = async (
  connectionId: number
): Promise<any> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/installations/${connectionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching installation details:', error);
    return null;
  }
};



export const fetchConsumerNumber = async (customerId: number) => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/connections/by-customer/${customerId}`);
    if (response.data?.success === false) {
      console.warn(`No connections found for customerId ${customerId}: ${response.data.message}`);
      return [];
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    console.warn(`Unexpected format for customerId ${customerId}:`, response.data);
    return [];
  } catch (error: any) {
    
    if (error.response && error.response.status === 404) {
      console.info(`Connections not found for customer Id ${customerId}`);
    } else {
      console.error(`Error fetching connections for customerId ${customerId}:`, error.message);
    }
    return [];
  }
};

export const fetchConsumersWithConnections = async (page = 0, params: { orgId?: number | null, orgName?: string | null, agencyId?: number | null, agencyName?: string | null, userRole?: string | null, userId?: number | null }) => {
  const crsAPI = getCrsAPI();
  try {
    console.log('CRS API Parameters for fetchConsumersWithConnections:', { ...params, page });

    const response = await crsAPI.get('/api/customers/with-connections/paginated', {
      params: { page, ...params },
    });

    return {
      content: response.data.content,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      currentPage: response.data.number,
      size: response.data.size,
    };
  } catch (error) {
    console.error('Error fetching consumers with connections:', error);
    throw new Error('Failed to fetch consumers with connections.');
  }
};


export const fetchOnboardedConsumers = async (page = 0, params: { orgId?: number | null, orgName?: string | null, agencyId?: number | null, agencyName?: string | null, userRole?: string | null, userId?: number | null }) => {
  const crsAPI = getCrsAPI();
  try {
    console.log('CRS API Parameters for fetchConsumersWithConnections:', { ...params, page });

    const response = await crsAPI.get('/api/customers/onboarded', {
      params: { page, ...params },
    });

    return {
      content: response.data.content,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      currentPage: response.data.number,
      size: response.data.size,
    };
  } catch (error) {
    console.error('Error fetching consumers with connections:', error);
    throw new Error('Failed to fetch consumers with connections.');
  }
};

export const getCustomerCount = async (): Promise<number> => {
  const crsAPI = getCrsAPI();

  
  const selectedOrg = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
  const { orgId, role } = selectedOrg;

  
  let params: Record<string, any> = {};
  if (role === "ROLE_ORG_STAFF" || role === "ROLE_ORG_REPRESENTATIVE") {
    params.orgId = orgId;
  } else if (role === "ROLE_AGENCY_STAFF" || role === "ROLE_AGENCY_REPRESENTATIVE") {
    params.agencyId = orgId;
  }

  try {
    const response = await crsAPI.get("/api/customers/count", { params });
    return response.data; 
  } catch (error) {
    console.error("Error fetching customer count:", error);
    throw new Error("Failed to fetch customer count");
  }
};



export const getOnboardedCustomerCount = async (): Promise<number> => {
  const crsAPI = getCrsAPI();

  
  const selectedOrg = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
  const { orgId, role } = selectedOrg;

  
  let params: Record<string, any> = {};
  if (role === "ROLE_ORG_STAFF" || role === "ROLE_ORG_REPRESENTATIVE") {
    params.orgId = orgId;
  } else if (role === "ROLE_AGENCY_STAFF" || role === "ROLE_AGENCY_REPRESENTATIVE") {
    params.agencyId = orgId;
  }

  try {
    const response = await crsAPI.get("/api/customers/onboarded-count", { params });
    return response.data; 
  } catch (error) {
    console.error("Error fetching customer count:", error);
    throw new Error("Failed to fetch customer count");
  }
};




export const updateConsumerPersonalDetails = async (
  customerId: number,
  updatedCustomerData: any
): Promise<any> => {
  const crsAPI = getCrsAPI();
  try {
    console.log("Sending request to update consumer:", updatedCustomerData);

    const response = await crsAPI.put(`/api/customers/${customerId}`, updatedCustomerData);

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to update consumer';
    console.error('Error updating consumer details:', message);
    throw new Error(message);
  }
};

export const updateInstallationSpaceDetails = async (
  id: number,
  updatedInstallationData: any
): Promise<any> => {
  const crsAPI = getCrsAPI();
  try {
    console.log('Sending request to update installation:', updatedInstallationData);

    const response = await crsAPI.put(`/api/installations/${id}`, updatedInstallationData);

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to update installation';
    console.error('Error updating installation details:', message);
    throw new Error(message);
  }
};

export const updateConsumerConnectionDetails = async (
  id: number,
  updatedData: any
): Promise<any> => {
  const crsAPI = getCrsAPI();
  try {
    console.log('Sending request to update consumer:', updatedData);

    const response = await crsAPI.put(`/api/connections/${id}`, updatedData);

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to update consumer connection';
    console.error('Error updating consumer details:', message);
    throw new Error(message);
  }
};

// src/services/districtService.ts
export const getDistrictNameByCode = async (code: number): Promise<string> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/district/name/${code}`, {
      responseType: 'text', // important for plain text responses
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching district name:', error);
    return 'Unknown District'; // Fallback value
  }
};

export const getTalukaNameByCode = async (code: number): Promise<string> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/taluka/name/${code}`, {
      responseType: 'text', // Axios will treat the response as plain text
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching taluka name:', error);
    return 'Unknown Taluka';
  }
};

export const getVillageNameByCode = async (code: number): Promise<string> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/village/name/${code}`, {
      responseType: 'text', // Axios will treat the response as plain text
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching village name:', error);
    return 'Unknown Village'; // Fallback value
  }
};


export const postMaterialData = async (
  connectionId: any,
  data: {
    connectionId: string;
    systemKw: string;
    makeOfModule: string;
    almmModelNo: string;
    serialNoOfModules: string;
    wattagePerModule: string;
    noOfModules: string;
    totalCapacity: string;
    warrantyDetails: string;
    inverterModuleNo: string;
    inverterMake: string;
    rating: string;
    chargeControllerType: string;
    inverterCapacity: string;
    earthingRod: string;
    dateOfInstallation: string;
    capacityType: string;
    projectModel: string;
    reInstalledCapacityRooftop: string;
    reInstalledCapacityGround: string;
    reInstalledCapacityTotal: string;
  }
): Promise<any> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.post(`/api/materials/${connectionId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error posting material data:', error);
    throw error; // So calling code can handle it
  }
};

export const updateMaterialData = async (
  connectionId: any,
  data: {
    connectionId: string;
    systemKw: string;
    makeOfModule: string;
    almmModelNo: string;
    serialNoOfModules: string;
    wattagePerModule: string;
    noOfModules: string;
    totalCapacity: string;
    warrantyDetails: string;
    inverterModuleNo: string;
    inverterMake: string;
    rating: string;
    chargeControllerType: string;
    inverterCapacity: string;
    earthingRod: string;
    dateOfInstallation: string;
    capacityType: string;
    projectModel: string;
    reInstalledCapacityRooftop: string;
    reInstalledCapacityGround: string;
    reInstalledCapacityTotal: string;
  }
): Promise<any> => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.put(`/api/materials/${connectionId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating material data:', error);
    throw error;
  }
};


export const searchCustomers = async (
  query: string,
  params: { orgId?: number | null; agencyId?: number | null; userRole?: string | null; userId?: number | null }
): Promise<any[]> => {
  const crsAPI = getCrsAPI();
  try {
    console.log("CRS API Parameters for searchCustomers:", { ...params, query });

    const response = await crsAPI.get(`/api/customers/search`, {
      params: { query, ...params },
    });

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    } else {
      console.error("Invalid API response format:", data);
      throw new Error("Failed to parse search results");
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw new Error("Failed to fetch search results");
  }
};

export const searchOnboardedConsumers = async (
  query: string,
  params: { orgId?: number | null; agencyId?: number | null; userRole?: string | null; userId?: number | null }
): Promise<any[]> => {
  const crsAPI = getCrsAPI();
  try {
    console.log("CRS API Parameters for searchCustomers:", { ...params, query });

    const response = await crsAPI.get(`/api/customers/search/onboarded`, {
      params: { query, ...params },
    });

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    } else {
      console.error("Invalid API response format:", data);
      throw new Error("Failed to parse search results");
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw new Error("Failed to fetch search results");
  }
};

export const getMaterialsByConnectionId = async (connectionId: number) => {
  const crsAPI = getCrsAPI();
  try {
    const response = await crsAPI.get(`/api/materials/${connectionId}`);

    if (!Array.isArray(response.data)) {
      console.warn(`Unexpected response format for connectionId ${connectionId}:`, response.data);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching materials for connectionId ${connectionId}:`, error);
    return [];
  }
};

export const getCustomerStats = async () => {
  const crsAPI = getCrsAPI();

  const selectedOrg = JSON.parse(localStorage.getItem("selectedOrg") || "{}");
  const { orgId, role } = selectedOrg;

  let params: Record<string, any> = {};
  if (role === "ROLE_ORG_STAFF" || role === "ROLE_ORG_REPRESENTATIVE") {
    params.orgId = orgId;
  } else if (role === "ROLE_AGENCY_STAFF" || role === "ROLE_AGENCY_REPRESENTATIVE") {
    params.agencyId = orgId;
  }

  try {
    const response = await crsAPI.get('/api/customers/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    throw new Error('Failed to fetch customer stats');
  }
};



