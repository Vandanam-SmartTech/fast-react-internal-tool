
import { QuotationData, District, Taluka, Village } from '../types/quotation';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7575/api';

const API = axios.create({
  baseURL: 'http://localhost:9090',
  headers: { 'Content-Type': 'application/json' },
});

// Automatically set the Authorization header if jwtToken exists in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('jwtToken', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('jwtToken');
    delete API.defaults.headers.common['Authorization'];
  }
};

const getAuthToken = () => localStorage.getItem('jwtToken');

export const generateQuotationPDF = async (data: QuotationData): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotations/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    return await response.blob();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to generate PDF from server');
  }
};

export const saveDataToServer = async (data: Record<string, any>): Promise<void> => {
  try {
    const response = await fetch('http://localhost:8585/api/internal-tool/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`, // Ensure getAuthToken() returns a valid JWT
      },
      body: JSON.stringify(data),
    });

    // Parse the response JSON
    const responseData = await response.json();

    // Check for success or failure based on the API's response
    if (response.ok && responseData.success) {
      alert(responseData.message || 'Data saved successfully!');
    } else {
      alert(responseData.message || 'Failed to save data.');
    }
  } catch (error: any) {
    // Improved error handling
    if (error.response) {
      alert(
        `Error: ${error.response.data.message || 'An error occurred on the server.'}`
      );
    } else if (error.request) {
      alert('Error: No response from the server. Please check your network connection.');
    } else {
      alert('Error: ' + error.message);
    }
    console.error('Error details:', error);
  }
};


export const calculateCosts = async (data: {
  connectionType: string;
  phase: string;
  dcrNonDcr: string;
  kw: number;
}): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/prices/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cost data');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch cost data');
  }
};

export const fetchPanelWattages = async (phase: string): Promise<number[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/panelWattages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ phase }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch panel wattages');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch panel wattages from server');
  }
};

export const calculateKw = async (
  phase: string,
  energyUsage: number
): Promise<number | null> => {
  const url = `${API_BASE_URL}/kw/calculate`;
  const requestPayload = {
    phase,
    energyUsage: energyUsage.toString(),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch KW value');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching KW:', error);
    return null;
  }
};

export const fetchDistricts = async (): Promise<District[]> => {
  try {
    const response = await fetch('http://localhost:8585/masters/district/27', {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw new Error('Failed to fetch districts');
  }
};

export const fetchTalukas = async (districtCode: number): Promise<Taluka[]> => {
  try {
    const response = await fetch(`http://localhost:8585/masters/taluka/${districtCode}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching talukas:', error);
    throw new Error('Failed to fetch talukas');
  }
};

export const fetchVillages = async (talukaCode: number): Promise<Village[]> => {
  try {
    const response = await fetch(`http://localhost:8585/masters/village/${talukaCode}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching villages:', error);
    throw new Error('Failed to fetch villages');
  }
};

export const fetchConsumers = async (page = 0) => {
  try {
    const response = await API.get(`http://localhost:8585/api/customers/by-representative/paginated`, {
      params: { page },
    });

    return {
      content: response.data.content, 
      totalPages: response.data.totalPages, 
      totalElements: response.data.totalElements, 
      currentPage: response.data.number, 
    };
  } catch (error) {
    console.error("Error fetching consumers:", error);
    throw new Error("Failed to fetch consumers.");
  }
};

export const updateConsumerPersonalDetails = async (customerId: number, updatedData: any) => {
  try {

    console.log("Sending request to update consumer:", updatedData);

    const response = await fetch(`http://localhost:8585/api/customers/${customerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update consumer: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating consumer details:", error);
    throw error;
  }
};

export const updateConsumerConnectionDetails = async (id: number, updatedData: any) => {
  try {

    console.log("Sending request to update consumer:", updatedData);

    const response = await fetch(`http://localhost:8585/api/connections/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update consumer: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating consumer details:", error);
    throw error;
  }
};
