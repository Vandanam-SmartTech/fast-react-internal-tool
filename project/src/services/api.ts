
import { QuotationData, District, Taluka, Village } from '../types/quotation';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.41.162:7575/api';

const API = axios.create({
  baseURL: 'http://192.168.41.162:9090',
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
  const response = await fetch('http://192.168.41.162:9090/jwt/claims', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
    },

  });

  const data = await response.json(); 
  return data.claims; 
};


export const fetchRepresentatives = async () => {
  try {
    const response = await fetch("http://192.168.41.162:9090/api/users/all", {
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

    const apiUrl = `http://192.168.41.162:8080/api/v3/quotation/generating-pdf/${connectionId}`;

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




export const saveDataToServer = async (data: Record<string, any>): Promise<void> => {
  try {
    const response = await fetch('http://192.168.41.162:8585/api/internal-tool/save', {
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


    const response = await fetch('http://192.168.41.162:8585/api/customers', {
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
    const response = await fetch('http://192.168.41.162:8585/api/connections', {
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
    const response = await fetch('http://192.168.41.162:8585/api/installations', {
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
  phaseType: string,
  dcrNonDcrType: string,
  brand: string
): Promise<number[]> => {
  try {
    console.log('Fetching panel wattages...');
    const response = await fetch(`http://192.168.41.162:8080/api/panelWattages/${connectionId}`, {
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
    const response = await fetch('http://192.168.41.162:8585/masters/district/27', {
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
    const response = await fetch(`http://192.168.41.162:8585/masters/taluka/${districtCode}`, {
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
    const response = await fetch(`http://192.168.41.162:8585/masters/village/${talukaCode}`, {
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

export const fetchInstallationSpaceTypes = async (consumerId: number): Promise<number[]> => {
  try {
      const response = await fetch(`http://192.168.41.162:8585/api/installations/consumer/${consumerId}`, {
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
      return Array.from(new Set(data.map((item: any) => item.installationSpaceTypeId)));
  } catch (error) {
      console.error("Error fetching installation space types:", error);
      return [];
  }
};

export const getCustomerById = async (customerId: number): Promise<any> => {
  try {
    const response = await fetch(`http://192.168.41.162:8585/api/customers/${customerId}`, {
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
    const response = await fetch(`http://192.168.41.162:8585/api/connections/${consumerId}`, {
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
    const response = await fetch(`http://192.168.41.162:8585/api/installations/consumer/${consumerId}`, {
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

export const getConnectionsByCustomerId = async (customerId: number): Promise<any> => {
  try {
    const response = await fetch(`http://192.168.41.162:8585/api/connections/customer/${customerId}`, {
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

export const getInstallationsByCustomerId = async (consumerId: number): Promise<any> => {
  try {
    const response = await fetch(`http://192.168.41.162:8585/api/installations/consumer/${consumerId}`, {
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
    const response = await API.get(`http://192.168.41.162:8585/api/customers/paginated`, {
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
    const response = await API.get(`http://192.168.41.162:8585/api/customers/onboarded/by-representative/paginated`, {
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
  const response = await fetch("http://192.168.41.162:8585/api/customers/onboarded-count",{
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
  const response = await fetch("http://192.168.41.162:8585/api/customers/count",{
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


export const fetchConsumerNumber = async (customerId: number) => {
  try {
    const response = await API.get(`http://192.168.41.162:8585/api/connections/by-customer/${customerId}`, {
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
    console.error(`Error fetching consumer numbers for customerId ${customerId}:`, error);
    return [];
  }
};



export const updateConsumerPersonalDetails = async (customerId: number, updatedCustomerData: any) => {
  try {

    console.log("Sending request to update consumer:", updatedCustomerData);

    const response = await fetch(`http://192.168.41.162:8585/api/customers/${customerId}`, {
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

    const response = await fetch(`http://192.168.41.162:8585/api/installations/${id}`, {
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

    const response = await fetch(`http://192.168.41.162:8585/api/connections/${id}`, {
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
    const response = await fetch(`http://192.168.41.162:8585/masters/district/name/${code}`);

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
    const response = await fetch(`http://192.168.41.162:8585/masters/taluka/name/${code}`);

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
    const response = await fetch(`http://192.168.41.162:8585/masters/village/name/${code}`);

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

    const response = await fetch(`http://192.168.41.162:8080/api/v2/recommendation/getAndSave/${connectionId}`, {
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
    const response = await fetch('http://192.168.41.162:8080/api/v3/getPrice', {
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
    endpoint = `http://192.168.41.162:5050/api/pdf/wcrUndertakingAdhar/${id}?download=true`;
  }
  if (docName === "Annexure 1") {
    endpoint = `http://192.168.41.162:5050/api/pdf/annexureProformaAConverted/${id}?download=true`;
  }
  if(docName=== "EarthingPageDocument"){
    endpoint = `http://192.168.41.162:5050/api/pdf/earthingPageController/${id}?download=true`;
  }
  if(docName=== "Subsidy Agreement Document-Page-1"){
    endpoint = `http://192.168.41.162:5050/api/pdf/subsidyagreementpageone/${id}?download=true`;
  }
  if(docName=== "Subsidy Agreement Document-Page-2"){
    endpoint = `http://192.168.41.162:5050/api/pdf/subsidyAgreementPageTwo/${id}?download=true`;
  }
  if(docName=== "Vendor Feasibility Document"){
    endpoint = `http://192.168.41.162:5050/api/pdf/vendorFeasibilityController/${id}?download=true`;
  }
  if(docName=== "Netmeter Agreement Document-Page-1"){
    endpoint = `http://192.168.41.162:5050/api/pdf/netAgreementOne/${id}?download=true`;
  }
  if(docName=== "Netmeter Agreement Document-Page-2"){
    endpoint = `http://192.168.41.162:5050/api/pdf/netAgreementTwo/${id}?download=true`;
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

  const apiUrl = `http://192.168.41.162:8080/api/v3/customer-agreed/${connectionId}`;

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

    const response = await axios.post("http://192.168.41.162:3000/api/files/upload", formData, {
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
  
  const url = `http://192.168.41.162:8585/api/materials?connectionId=${connectionId}`;
  
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

  const response = await axios.post("http://192.168.41.162:3000/api/files/upload", formData, {
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
    const response = await axios.get("http://192.168.41.162:3000/api/files/list", {
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









