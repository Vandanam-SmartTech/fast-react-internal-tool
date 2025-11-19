import axios from 'axios';
import { getAuthToken } from './jwtService';
import { getConfig } from '../config';
import { toast } from "react-toastify";

export const getQuotationAPI = () => {
  const { VITE_QUOTATION_API } = getConfig();

  const quotationAPI = axios.create({
    baseURL: VITE_QUOTATION_API,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  quotationAPI.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return quotationAPI;
};

// export const generateQuotationPDF = async (selectedSpecId: number): Promise<Blob> => {
//   const quotationAPI = getQuotationAPI();
//   try {
//     if (!selectedSpecId) {
//       throw new Error("Spec ID is missing");
//     }

//     const response = await quotationAPI.get(`/api/quotation-details/generate-pdf/${selectedSpecId}`, {
//       responseType: 'blob', 
//     });

//     return response.data; 
//   } catch (error) {
//     console.error("API Error:", error);
//     throw new Error("Failed to generate PDF from server");
//   }
// };


export const generateQuotationPDF = async (selectedSpecId: number, quotationGeneratedDate: Date): Promise<Blob> => {
  const quotationAPI = getQuotationAPI();
  try {
    if (!selectedSpecId) throw new Error("Spec ID is missing");

    // Format date as dd/MM/yyyy
    const day = String(quotationGeneratedDate.getDate()).padStart(2, "0");
    const month = String(quotationGeneratedDate.getMonth() + 1).padStart(2, "0");
    const year = quotationGeneratedDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const response = await quotationAPI.get(
      `/api/quotation-details/generate-pdf/${selectedSpecId}`,
      {
        responseType: "blob",
        params: { quotationGeneratedDate: formattedDate },
      }
    );

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to generate PDF from server");
  }
};

export const previewQuotationPDF = async (systemSpecsId: number): Promise<Blob> => {
  const quotationAPI = getQuotationAPI();
  try {
    if (!systemSpecsId) {
      throw new Error("System Specs ID is missing");
    }

    const response = await quotationAPI.get(`/api/quotation-details/preview-quotation/${systemSpecsId}`, {
      responseType: 'blob', 
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to generate PDF from server");
  }
};

export const fetchPanelWattages = async (
  phaseType: string,
  dcrNonDcrType: string,
  brand: string
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching panel wattages...");

    const response = await quotationAPI.get("/api/panelWattage", {
      params: {
        phaseType,
        dcrNonDcrType,
        customerSelectedBrand: brand,
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch panel wattages from server");
  }
};



export const fetchInverters = async (
  phaseType: string,
  inversionType: string
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get(`/api/inverter/inverterBrands`, {
      params: {
        phaseType,
        gridType: inversionType,
      },
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch inverter wattages from server');
  }
};

export const fetchPanels = async (
  phaseType: string,
  dcrNonDcrType: string
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching inverters...");
    console.log("Request params:", {
      phaseType,
      dcrNondcr: dcrNonDcrType,
    });

    const response = await quotationAPI.get(`/api/panelBrands`, {
      params: {
        phaseType,
        dcrNondcr: dcrNonDcrType,
      },
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch inverter wattages from server');
  }
};

export const fetchInverterWattages = async (
  phaseType: string,
  inverterBrand: string
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log('Fetching inverter wattages...');

    const response = await quotationAPI.get(`/api/inverter/inverterCapacity`, {
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

    const response = await quotationAPI.get(`/api/recommendation/getAndSave/${connectionId}`);

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


export const getPriceDetails = async (
  data: Record<string, any>
): Promise<Record<string, any> | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post("/api/system-cost", data);
    console.log("API response data:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch price details.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error details:", error);
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


export const saveSystemSpecs = async (requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  if (!requestData?.connectionId) {
    throw new Error("connectionId is missing in requestData!");
  }

  try {
    const response = await quotationAPI.post(`/api/system-specs/create`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error saving system specs:", error);
    throw new Error("Failed to save system specs.");
  }
};

export const saveSystemSpecPackage = async (requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.post(`/api/system-spec-package`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error saving system specs:", error);
    throw new Error("Failed to save system specs.");
  }
};

export const saveInverterSpecs = async (requestData: any | any[]): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  // ✅ Ensure it's always sent as an array
  const payload = Array.isArray(requestData) ? requestData : [requestData];

  try {
    const response = await quotationAPI.post(`/api/system-spec-inverters`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving inverter specs:", error);
    throw new Error("Failed to save inverter specs.");
  }
};

export const savePipeSpecs = async (requestData: any | any[]): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  // ✅ Ensure it's always sent as an array
  const payload = Array.isArray(requestData) ? requestData : [requestData];

  try {
    const response = await quotationAPI.post(`/api/system-spec-pipes/create`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving pipe specs:", error);
    throw new Error("Failed to save pipe specs.");
  }
};



export const saveInverterSpecPackage = async (requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.post(
      `/api/system-spec-inverter-packages?inverterSpecId=${requestData.inverterSpecId}`, 
      {
        systemSpecsPackageId: requestData.systemSpecsPackageId,
        inverterCount: requestData.inverterCount,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating inverter spec package:", error);
    throw new Error("Failed to create inverter spec package.");
  }
};

export const updateSystemSpecs = async (id: number, requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  if (!id) {
    throw new Error("systemSpecsId is missing for update!");
  }

  try {
    const response = await quotationAPI.put(`/api/system-specs/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error updating system specs:", error);
    throw new Error("Failed to update system specs.");
  }
};

export const updateInverterSpecs = async (id: number, requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  if (!id) {
    throw new Error("inverterSpecsId is missing for update!");
  }

  if (!requestData.inverterSpecId) {
    throw new Error("inverterSpecId is missing in requestData!");
  }

  try {
    const response = await quotationAPI.put(
      `/api/system-spec-inverters/${id}?inverterSpecId=${requestData.inverterSpecId}`,
      {
        systemSpecsId: requestData.systemSpecsId,
        inverterCount: requestData.inverterCount,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating inverter specs:", error);
    throw new Error("Failed to update inverter specs.");
  }
};


export const checkSystemSpecificationsExists = async (
  connectionId: string
): Promise<boolean> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get('/api/connectionId-exist', {
      params: { connectionId },
    });

    return response.data === true;
  } catch (error) {
    console.error('Error checking system specifications available for connectionId:', error);
    return false;
  }
};

export const fetchBatteryWattages = async (
  batteryBrand: string
): Promise<string[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get('/api/battery-details/battery-capacity', {
      params: { batteryBrand },
    });

    return response.data || []; // Example: ["5", "10", "15", ...]
  } catch (error) {
    console.error('Error fetching battery capacities:', error);
    return [];
  }
};

export const fetchSystemRelatedDetails = async (connectionId: number) => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log(`Fetching system related details for connection Id: ${connectionId}`);

    const response = await quotationAPI.get(`/api/checkRequiredMaterial/${connectionId}`);

    return response.data;
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data || error.message;
    console.error(`Error fetching system related details. Status: ${status}, Message: ${message}`);
    throw new Error(`Failed to fetch system details. Status: ${status}, Message: ${message}`);
  }
};

export const getMaterialOrigins = async (): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get("/api/material-origins");
    console.log("Material origins:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch material origins.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error fetching material origins:", error);
    return null;
  }
};

export const getGridTypes = async (): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get("/api/grid-types");
    console.log("Grid types:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch grid types.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error fetching grid types:", error);
    return null;
  }
};

export const fetchInverterBrands = async (
  phaseTypeId: number,
  gridTypeId: number
): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching inverters...");
    console.log("Request params:", { phaseTypeId, gridTypeId });

    const response = await quotationAPI.get(`/api/inverter-brands/by-grid-phase`, {
      params: { phaseTypeId, gridTypeId },
    });

    return response.data; 
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch inverter brands from server");
  }
};


export const fetchInverterBrandCapacities = async (
  inverterBrandId: number
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching inverter capacities...");
    console.log("Request params:", {
      inverterBrandId
    });

    const response = await quotationAPI.get(`/api/inverter-specs/capacities`, {
      params: {
        inverterBrandId
      },
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch inverter brand capacities from server');
  }
};

export const fetchPanelBrands = async (
  materialOriginId: number
): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching panels...");
    console.log("Request params:", { materialOriginId });

    const response = await quotationAPI.get(`/api/panel-brands/by-material-origin`, {
      params: { materialOriginId },
    });

    return response.data; 
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch panel brands from server");
  }
};

export const fetchPanelBrandCapacities = async (
  phaseTypeId: number,
  panelSpecId: number
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching panel brand capacities...");

    const response = await quotationAPI.get("/api/panel-specs/pv-capacity", {
      params: {
        phaseTypeId,
        panelSpecId
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch panel brand capacities from server");
  }
};

export const fetchBatteryBrands = async (): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get("/api/battery-brands");
    console.log("Battery brands:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch battery brands.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error fetching battery brands:", error);
    return null;
  }
};

export const fetchBatteryBrandCapacities = async (
  batteryBrandId: number
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching battery brand capacities...");

    const response = await quotationAPI.get("/api/battery-specs/brands", {
      params: {
        batteryBrandId
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch battery brand capacities from server");
  }
};

export const getSavedSystemSpecs = async (connectionId: number): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();

  if (!connectionId) {
    throw new Error("connectionId is required to fetch saved system specs!");
  }

  try {
    const response = await quotationAPI.get(`/api/connection-system-specs/by-connection/${connectionId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching saved system specs:", error);
    return []; 
  }
};

export const getSavedSystemSpecPackages = async (): Promise<any[]> => { 
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.get(`/api/system-spec-package`);
    return response.data;
  } catch (error) {
    console.error("Error fetching saved system spec packages:", error);
    return [];
  }
};

export const getSecondaryId = async (systemSpecificationId: number): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();

  if (!systemSpecificationId) {
    throw new Error("systemSpecificationId is required to fetch secondaryId!");
  }

  try {
    const response = await quotationAPI.get(`/api/quotation-details/${systemSpecificationId}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching secondary Id:", error);
    return []; 
  }
};

export const fetchPipeSpecification = async (): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get("/api/pipe-specs");
    console.log("Pipe specs:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch pipe specs.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error fetching pipe specs:", error);
    return null;
  }
};

export const deleteSpecAPI = async (specId: any) => {
  try {
    const quotationAPI = getQuotationAPI();
    const response = await quotationAPI.delete(
      `/api/connection-system-specs/${specId}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};




