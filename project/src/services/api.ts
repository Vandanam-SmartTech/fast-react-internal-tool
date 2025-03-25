
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

export const generateQuotationPDF = async (connectionId: number, requestData: object): Promise<Blob> => {
  try {
    const response = await fetch(`http://localhost:8080/api/v2/quotation/customerSelected/pdf/${connectionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`, // Attach Bearer token
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    return await response.blob();
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to generate PDF from server");
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

export const saveCustomer = async (data: Record<string, any>): Promise<number | null> => {
  try {


    const response = await fetch('http://localhost:8585/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    // Parse the response JSON
    const responseData = await response.json();
    console.log('API response data:', responseData); // Debug: check the full response

    // Check if the response is OK and the id exists
    if (response.ok && responseData.id) {
      alert('Customer data saved successfully!');
      return responseData.id; // Return the id from CustomerDTO
    } else {
      alert(responseData.message || 'Failed to save customer data.');
      return null;
    }
  } catch (error: any) {
    alert('An error occurred while saving customer data.');
    console.error('Error details:', error);
    return null;
  }
};

export const saveConnection = async (data: Record<string, any>): Promise<number | null> => {
  try {
    const response = await fetch('http://localhost:8585/api/connections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    // Parse the response JSON
    const responseData = await response.json();
    console.log('API response data:', responseData); // Debug: check the full response

    // Check if the response is OK and the id exists
    if (response.ok && responseData.id) {
      alert('Connection data saved successfully!');
      return responseData.id; // Return the id from CustomerDTO
    } else {
      alert(responseData.message || 'Failed to save connection data.');
      return null;
    }
  } catch (error: any) {
    alert('An error occurred while saving connection data.');
    console.error('Error details:', error);
    return null;
  }
};

export const saveInstallation = async (data: Record<string, any>): Promise<number | null> => {
  try {
    const response = await fetch('http://localhost:8585/api/installations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    // Parse the response JSON
    const responseData = await response.json();
    console.log('API response data:', responseData); // Debug: check the full response

    // Check if the response is OK and the id exists
    if (response.ok && responseData.id) {
      alert('Installation data saved successfully!');
      return responseData.id; // Return the id from CustomerDTO
    } else {
      alert(responseData.message || 'Failed to save installation data.');
      return null;
    }
  } catch (error: any) {
    alert('An error occurred while saving installation data.');
    console.error('Error details:', error);
    return null;
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

export const fetchPanelWattages = async (
  connectionId: string,
  phase: string,
  dcrNonDcr: string,
  brand: string
): Promise<number[]> => {
  try {
    console.log('Fetching panel wattages...');
    const response = await fetch(`http://localhost:8080/api/panelWattages/${connectionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ phase, dcrNonDcr, customerSelectedBrand: brand }),
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

export const updateConsumerPersonalDetails = async (customerId: number, updatedCustomerData: any) => {
  try {

    console.log("Sending request to update consumer:", updatedCustomerData);

    const response = await fetch(`http://localhost:8585/api/customers/${customerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updatedCustomerData),
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

export const fetchRecommendedDetails = async (connectionId: number) => {
  try {
    console.log(`Fetching recommendation for connectionId: ${connectionId}`);

    const response = await fetch(`http://localhost:8080/api/v2/recommendation/getAndSave/${connectionId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch recommendation. Status: ${response.status}, Message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recommended details:", error);
    alert("Failed to fetch recommended details. Please try again.");
    return null; // Prevent app crash
  }
};

export const getPriceDetails = async (data: Record<string, any>): Promise<Record<string, any> | null> => {
  try {
    const response = await fetch('http://localhost:8080/api/v3/getPrice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    // Parse the response JSON
    const responseData = await response.json();
    console.log('API response data:', responseData); // Debugging: log the response

    if (response.ok) {
      return responseData; // Return the price details
    } else {
      alert(responseData.message || 'Failed to fetch price details.');
      return null;
    }
  } catch (error: any) {
    alert('An error occurred while fetching price details.');
    console.error('Error details:', error);
    return null;
  }
};

export const fetchPdf = async (id: number, docName: string): Promise<Response> => {
  let endpoint = "";

  if (docName === "WCR Page-1") {
    endpoint = `http://localhost:5050/api/pdf/wcrUndertakingAdhar/${id}?download=true`;
  }
  if (docName === "Annexure 1") {
    endpoint = `http://localhost:5050/api/pdf/annexureProformaAConverted/${id}?download=true`;
  }
  if(docName=== "EarthingPageDocument"){
    endpoint = `http://localhost:5050/api/pdf/earthingPageController/${id}?download=true`;
  }
  if(docName=== "Subsidy Agreement Document-Page-1"){
    endpoint = `http://localhost:5050/api/pdf/subsidyagreementpageone/${id}?download=true`;
  }
  if(docName=== "Subsidy Agreement Document-Page-2"){
    endpoint = `http://localhost:5050/api/pdf/subsidyAgreementPageTwo/${id}?download=true`;
  }
  if(docName=== "Vendor Feasibility Document"){
    endpoint = `http://localhost:5050/api/pdf/vendorFeasibilityController/${id}?download=true`;
  }
  if(docName=== "Netmeter Agreement Document-Page-1"){
    endpoint = `http://localhost:5050/api/pdf/netAgreementOne/${id}?download=true`;
  }
  if(docName=== "Netmeter Agreement Document-Page-2"){
    endpoint = `http://localhost:5050/api/pdf/netAgreementTwo/${id}?download=true`;
  }
  // Add other documents' API endpoints here if needed

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Accept": "application/pdf",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch document");
    }

    return response;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};






