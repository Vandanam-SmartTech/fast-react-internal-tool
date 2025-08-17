import axios from 'axios';
import { getAuthToken } from './jwtService';
import { getConfig } from '../config';

export const getQuotationAPI = () => {
  const { VITE_QUOTATION_API } = getConfig();

  const quotationAPI = axios.create({
    baseURL: VITE_QUOTATION_API,
    headers: { 'Content-Type': 'application/json' },
  });

  quotationAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return quotationAPI;
};

/**
 * Build organization/agency context params expected by backend.
 * Supports both legacy keys (selectedOrganization*) and new JSON key (selectedOrg).
 */
const buildOrgParams = () => {
  let orgId = localStorage.getItem('selectedOrganization');
  let orgName = localStorage.getItem('selectedOrganizationName');
  const agencyId = localStorage.getItem('selectedAgency');
  const agencyName = localStorage.getItem('selectedAgencyName');

  if (!orgId || !orgName) {
    const selectedOrgStr = localStorage.getItem('selectedOrg');
    if (selectedOrgStr) {
      try {
        const parsed = JSON.parse(selectedOrgStr);
        if (!orgId && parsed.orgId) orgId = String(parsed.orgId);
        if (!orgName && parsed.orgName) orgName = String(parsed.orgName);
      } catch {
        // ignore parsing errors; params will remain undefined if not available
      }
    }
  }

  return { orgId, orgName, agencyId, agencyName };
};

export const generateQuotationPDF = async (connectionId: number): Promise<Blob> => {
  const quotationAPI = getQuotationAPI();
  try {
    if (!connectionId) {
      throw new Error("Connection ID is missing");
    }

    const response = await quotationAPI.get(`/api/quotation/generate-pdf/${connectionId}`, {
      responseType: 'blob', 
    });

    return response.data; 
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to generate PDF from server");
  }
};

export const previewQuotationPDF = async (connectionId: number): Promise<Blob> => {
  const quotationAPI = getQuotationAPI();
  try {
    if (!connectionId) {
      throw new Error("Connection ID is missing");
    }

    const response = await quotationAPI.get(`/api/preview-quotation/${connectionId}`, {
      responseType: 'blob', 
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to generate PDF from server");
  }
};

export const fetchPanelWattages = async (
  connectionId: string,
  phaseType: string,
  dcrNonDcrType: string,
  brand: string
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log('Fetching panel wattages...');

    const response = await quotationAPI.post(`/api/panelWattage/${connectionId}`, {
      phaseType,
      dcrNonDcrType,
      customerSelectedBrand: brand,
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch panel wattages from server');
  }
};

export const fetchInverterWattages = async (
  phaseType: string,
  inverterBrand: string
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log('Fetching inverter wattages...');

    const response = await quotationAPI.get(`/api/inverterCapacity`, {
      params: {
        phaseType,
        inverterBrand,
      },
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch inverter wattages from server');
  }
};

export const fetchRecommendedDetails = async (connectionId: number) => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log(`Fetching recommendation for connectionId: ${connectionId}`);

    const response = await quotationAPI.get(`/api/recommendation/getAndSave/${connectionId}`, {
      params: buildOrgParams(),
    });

    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data || error.message;
    console.error(`Error fetching recommended details. Status: ${status}, Message: ${message}`);
    throw new Error(`Failed to fetch recommendation. Status: ${status}, Message: ${message}`);
  }
};

export const fetchCustomerAgreedDetails = async (connectionId: number) => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log(`Fetching customer-agreed data for connectionId: ${connectionId}`);

    const response = await quotationAPI.get(`/api/customer-agreed/${connectionId}`);

    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data || error.message;
    console.error(`Error fetching customer-agreed details. Status: ${status}, Message: ${message}`);
    return { success: false }; 
  }
};


export const getPriceDetails = async (data: Record<string, any>): Promise<Record<string, any> | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post('/api/getPrice', data);

    console.log('API response data:', response.data); 

    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch price details.';
    alert(message);
    console.error('Error details:', error);
    return null;
  }
};

export const fetchBrandCapacityDetails = async (connectionId: number): Promise<Record<string, any> | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get(`/api/checkBrandAndCapacity/${connectionId}`);

    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data || error.message;
    console.error(`Error fetching KW and Brand: Status ${status}, Message: ${message}`);
    alert("Failed to fetch details. Please try again.");
    return null;
  }
};

export const saveCustomerSpecs = async (connectionId: string, requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();
  if (!connectionId) {
    throw new Error("Connection ID is missing!");
  }

  try {
    const response = await quotationAPI.post(`/api/customer-agreed/${connectionId}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error saving system specs:", error);
    throw new Error("Failed to save specifications.");
  }
};