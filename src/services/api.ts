
import SockJS from 'sockjs-client';
import { QuotationData, District, Taluka, Village } from '../types/quotation';
import axios from 'axios';
import { Client } from '@stomp/stompjs';

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

export const fetchClaims = async () => {
  //const token = localStorage.getItem('jwtToken');
  try{
  const response = await fetch('http://localhost:9090/jwt/claims', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },

  });

  const data = await response.json(); 
  return data.claims; 
}catch (error) {
  console.error('Error fetching claims:', error);
  return null; 
}
};


export const fetchRepresentatives = async () => {
  try {
    const response = await fetch("http://localhost:9090/api/users/all", {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();

    // Filter users with the role "ROLE_REPRESENTATIVE"
    return data
      .filter(user => user.roles.some(role => role.name === "ROLE_REPRESENTATIVE"))
      .map(user => ({
        userId: user.userId,
        name: user.nameAsPerGovId, 
        representativeCode: user.representativeCode,
        mobileNumber: user.mobileNumber,
        emailAddress: user.emailAddress
      }));
  } catch (error) {
    console.error("Error fetching representatives:", error);
    return [];
  }
};


export const generateQuotationPDF = async (connectionId: number): Promise<Blob> => {
  try {
    if (!connectionId) {
      throw new Error("Connection ID is missing");
    }

    const apiUrl = `http://localhost:8080/api/v3/quotation/generating-pdf/${connectionId}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`, // Attach Bearer token if needed
      },
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

export const createStompClient = () => {
  const stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8585/ws'), // Correct SockJS usage
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
    // connectHeaders: {
    //   Authorization: `Bearer ${getAuthToken()}`
    // },
    onConnect: () => {
      console.log('Connected to WebSocket');
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    },
  });

  return stompClient;
};

export const checkMobileNumberExists = async (mobileNumber: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:8585/api/customers/check-mobile?mobileNumber=${mobileNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      console.error('Server responded with error:', response.status);
      return false;
    }

    const data: boolean = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking mobile number', error);
    return false; // Default to false if error occurs
  }
};

export const checkEmailAddressExists = async (emailAddress: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:8585/api/customers/check-email?emailAddress=${emailAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      console.error('Server responded with error:', response.status);
      return false;
    }

    const data: boolean = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking email address', error);
    return false; // Default to false if error occurs
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


export const fetchPanelWattages = async (
  connectionId: string,
  phaseType: string,
  dcrNonDcrType: string,
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
      body: JSON.stringify({ phase: phaseType, dcrNonDcr: dcrNonDcrType, customerSelectedBrand: brand }),
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

export const fetchConnectionType = async (): Promise<{ id: number; nameEn: string }[]> => {
  try {
    const response = await fetch('http://localhost:8585/api/connectionType', {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching connection types:', error);
    throw new Error('Failed to fetch connection types');
  }
};

export const fetchPhaseType = async (): Promise<{ id: number; nameEn: string }[]> => {
  try {
    const response = await fetch('http://localhost:8585/api/phaseType', {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching phase types:', error);
    throw new Error('Failed to fetch phase types');
  }
};

export const fetchAddressType = async (): Promise<{ id: number; nameEn: string }[]> => {
  try {
    const response = await fetch('http://localhost:8585/api/addressType', {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching address types:', error);
    throw new Error('Failed to fetch address types');
  }
};

export const fetchCorrectionType = async (): Promise<{ id: number; nameEn: string }[]> => {
  try {
    const response = await fetch('http://localhost:8585/api/correctionType', {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching correction types:', error);
    throw new Error('Failed to fetch correction types');
  }
};

export const fetchInstallationSpaceTypesNames = async (): Promise<{ id: number; nameEnglish: string }[]> => {
  try {
    const response = await fetch('http://localhost:8585/api/installationSpaceTypes', {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching correction types:', error);
    throw new Error('Failed to fetch correction types');
  }
};



export const fetchInstallationSpaceTypes = async (consumerId: number): Promise<number[]> => {
  try {
      const response = await fetch(`http://localhost:8585/api/installations/consumer/${consumerId}`, {
          method: "GET",
          headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
          throw new Error(`Failed to fetch installation space types: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract unique installationSpaceTypeIds
      return data;
  } catch (error) {
      console.error("Error fetching installation space types:", error);
      return [];
  }
};

export const getCustomerById = async (customerId: number): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:8585/api/customers/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch customer details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return null;
  }
};

export const getConnectionByConsumerId = async (consumerId: number): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:8585/api/connections/${consumerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch connection details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching connection details:", error);
    return null;
  }
};

export const getInstallationByConsumerId = async (consumerId: number): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:8585/api/installations/consumer/${consumerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch installation details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching installation details:", error);
    return null;
  }
};

// export const getConnectionsByCustomerId = async (customerId: number): Promise<any> => {
//   try {
//     const response = await fetch(`http://localhost:8585/api/connections/customer/${customerId}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${getAuthToken()}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch connection details");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching connection details:", error);
//     return null;
//   }
// };

export const fetchConsumerNumber = async (customerId: number) => {
  try {
    const response = await API.get(`http://localhost:8585/api/connections/by-customer/${customerId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!Array.isArray(response.data)) {
      console.warn(`Unexpected response format for customerId ${customerId}:`, response.data);
      return [];
    }

    return response.data; // Return full array
  } catch (error) {
    console.error(`Error fetching details for customerId ${customerId}:`, error);
    return [];
  }
};

export const getInstallationsByCustomerId = async (consumerId: number): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:8585/api/installations/consumer/${consumerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch installation details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching installation details:", error);
    return null;
  }
};

export const fetchConsumers = async (page = 0) => {
  try {
    const response = await API.get(`http://localhost:8585/api/customers/paginated`, {
      params: { page },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
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

export const fetchOnboardedConsumers = async (page = 0) => {
  try {
    const response = await API.get(`http://localhost:8585/api/customers/onboarded/by-representative/paginated`, {
      params: { page },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
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


export const getOnboardedCustomerCount = async() :Promise<Number> => {
  const response = await fetch("http://localhost:8585/api/customers/onboarded-count",{
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${getAuthToken()}`,
    },
  });

  if(!response.ok){
    throw new Error("Failed to fetch onboarded customer count");
  }

  const count = await response.json();
  return count;
}

export const getCustomerCount = async() :Promise<Number> => {
  const response = await fetch("http://localhost:8585/api/customers/count",{
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${getAuthToken()}`,
    },
  });

  if(!response.ok){
    throw new Error("Failed to fetch customer count");
  }

  const count = await response.json();
  return count;

}




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

export const updateInstallationSpaceDetails = async (id: number, updatedInstallationData: any) => {
  try {

    console.log("Sending request to update installation:", updatedInstallationData);

    const response = await fetch(`http://localhost:8585/api/installations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updatedInstallationData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update installation: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating installation details:", error);
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

// src/services/districtService.ts
export const getDistrictNameByCode = async (code: number): Promise<string> => {
  try {
    const response = await fetch(`http://localhost:8585/masters/district/name/${code}`);

    if (!response.ok) {
      throw new Error("Failed to fetch district name");
    }

    return await response.text(); // API returns a plain string
  } catch (error) {
    console.error("Error fetching district name:", error);
    return "Unknown District"; // Fallback value
  }
};

export const getTalukaNameByCode = async (code: number): Promise<string> => {
  try {
    const response = await fetch(`http://localhost:8585/masters/taluka/name/${code}`);

    if (!response.ok) {
      throw new Error("Failed to fetch taluka name");
    }

    return await response.text(); // API returns a plain string
  } catch (error) {
    console.error("Error fetching taluka name:", error);
    return "Unknown Taluka"; // Fallback value
  }
};

export const getVillageNameByCode = async (code: number): Promise<string> => {
  try {
    const response = await fetch(`http://localhost:8585/masters/village/name/${code}`);

    if (!response.ok) {
      throw new Error("Failed to fetch village name");
    }

    return await response.text(); // API returns a plain string
  } catch (error) {
    console.error("Error fetching taluka name:", error);
    return "Unknown Village"; // Fallback value
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
    const response = await fetch('http://localhost:8080/api/v4/getPrice', {
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

export const fetchBrandCapacityDetails = async (connectionId: number) => {
  try{
    const response = await fetch(`http://localhost:8080/api/checkBrandAndCapacity/${connectionId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch KW and Brand: ${response.status}, Message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching KW and Brand:", error);
    alert("Failed to fetch details. Please try again.");
    return null; // Prevent app crash
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


export const saveCustomerSpecs = async (connectionId: string, requestData: any) => {
  if (!connectionId) {
      throw new Error("Connection ID is missing!");
  }

  const apiUrl = `http://localhost:8080/api/v3/customer-agreed/${connectionId}`;

  try {
      const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(requestData),
      });

      if (!response.ok) {
          throw new Error("Failed to save specifications.");
      }

      return await response.json();
  } catch (error) {
      console.error("Error saving system specs:", error);
      throw error;
  }
};


export const uploadFileToOneDrive = async (
  file: Blob,
  consumerId: string | number,
  govIdName: string,
  districtName: string,
  talukaName: string,
  villageName: string
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("files", file, `quotation_${consumerId}.pdf`);
    formData.append("consumerNumber", String(consumerId));
    formData.append("customerName", govIdName);
    formData.append("district", districtName);
    formData.append("taluka", talukaName);
    formData.append("village", villageName);
    formData.append("state", "Maharashtra"); // Default state
    formData.append("folderType", "Onboarding Documents"); // Default folder

    const response = await axios.post("http://localhost:3000/api/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading file to OneDrive:", error);
    throw error;
  }
};

export const postMaterialData = async (connectionId: any, data: { connectionId: string; systemKw: string; makeOfModule: string; almmModelNo: string; serialNoOfModules: string; wattagePerModule: string; noOfModules: string; totalCapacity: string; warrantyDetails: string; inverterModuleNo: string; inverterMake: string; rating: string; chargeControllerType: string; inverterCapacity: string; earthingRod: string; dateOfInstallation: string; capacityType: string; projectModel: string; reInstalledCapacityRooftop: string; reInstalledCapacityGround: string; reInstalledCapacityTotal: string; }) => {
  
  const url = `http://localhost:8585/api/materials?connectionId=${connectionId}`;
  
  try {
    const response = await axios.post(url, data, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    return response; // success
  } catch (error) {
    throw error; // re-throw so component can handle the error
  }
};

export const searchCustomers = async (query: string): Promise<any> => {
  try {
    const response = await fetch(`http://localhost:8585/api/customers/searchByAny?query=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const data = await response.json();
    // Validate the response data to ensure it's in the expected format
    if (Array.isArray(data)) {
      // Assuming each item in the array has the following properties: id, govIdName, emailAddress, mobileNumber
      return data.map((item: any) => (
        {
        id: item?.id,
        govIdName: item?.govIdName,
        emailAddress: item?.emailAddress,
        mobileNumber: item?.mobileNumber,
        consumerId: item?.connectionId, // Added consumerId property
      })
    );
    } else {
      console.error("Invalid API response format:", data);
      throw new Error("Failed to parse search results");
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw new Error("Failed to fetch search results");
  }
};


export const uploadDocuments = async (
  consumerId: string,
  districtName: string,
  talukaName: string,
  villageName: string,
  govIdName: string,
  aadharFile: File | null,
  passbookFile: File | null,
  billFile: File | null
) => {
  const formData = new FormData();

  formData.append("state", "Maharashtra");
  formData.append("district", districtName);
  formData.append("taluka", talukaName);
  formData.append("village", villageName);
  formData.append("customerName", govIdName);
  formData.append("consumerNumber", consumerId);
  formData.append("folderType", "Onboarding Documents");
  formData.append("override", "true");

  if (aadharFile) formData.append("files", aadharFile, "Aadhar Card.pdf");
  if (passbookFile) formData.append("files", passbookFile, "Bank Passbook.pdf");
  if (billFile) formData.append("files", billFile, "Electricity Bill.pdf");

  const response = await axios.post("http://localhost:3000/api/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const fetchUploadedDocuments = async (
  consumerId: string,
  districtName: string,
  talukaName: string,
  villageName: string,
  govIdName: string
) => {
  try {
    const response = await axios.get("http://localhost:3000/api/files/list", {
      params: {
        state: "Maharashtra",
        district: districtName,
        taluka: talukaName,
        village: villageName,
        customerName: govIdName,
        consumerNumber: consumerId,
        folderType: "Onboarding Documents"
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching documents", error);
    return [];
  }
};









