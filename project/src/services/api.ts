import { QuotationData,District,Taluka,Village } from '../types/quotation';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7575/api';

const API = axios.create({
  baseURL: 'http://localhost:9090',
  headers: { 'Content-Type': 'application/json' },
});

export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const setAuthToken = (token) => {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
};


export const generateQuotationPDF = async (data: QuotationData, token: string): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotations/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Add Authorization header
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



// Function to fetch cost values based on the provided parameters
export const calculateCosts = async (
  data: {
    connectionType: string;
    phase: string;
    dcrNonDcr: string;
    kw: number;
  },
  token: string // Add token as a parameter
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/prices/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Include Authorization header
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cost data');
    }

    return await response.json(); // Assuming the response is in JSON format
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch cost data');
  }
};



// Function to fetch panel wattages based on phase type
export const fetchPanelWattages = async (
  phase: string,
  token: string // Add token as a parameter
): Promise<number[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/panelWattages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Include Authorization header
      },
      body: JSON.stringify({ phase }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch panel wattages');
    }

    return await response.json(); // Assuming the response is a JSON array of numbers
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch panel wattages from server');
  }
};



//api for calculate kw using enrgy usage and phase type
export const calculateKw = async (
  phase: string,
  energyUsage: number,
  token: string // Add token as a parameter
): Promise<number | null> => {
  const url = 'http://localhost:7575/api/kw/calculate';
  const requestPayload = {
    phase,
    energyUsage: energyUsage.toString(), // Converting energyUsage to string as per backend requirements
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Include Authorization header
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch KW value');
    }

    const data = await response.json();
    return data; // Assuming the response contains the KW value as a number
  } catch (error) {
    console.error('Error fetching KW:', error);
    return null; // Return null in case of error
  }
};




// Typing the return value of the fetch functions as arrays of the respective types
export const fetchDistricts = async (): Promise<District[]> => {
  const response = await fetch('http://localhost:8585/masters/district/27');
  const data = await response.json();
  return data;
};

export const fetchTalukas = async (districtCode: number): Promise<Taluka[]> => {
  const response = await fetch(`http://localhost:8585/masters/taluka/${districtCode}`);
  const data = await response.json();
  return data;
};

export const fetchVillages = async (talukaCode: number): Promise<Village[]> => {
  const response = await fetch(`http://localhost:8585/masters/village/${talukaCode}`);
  const data = await response.json();
  return data;
};