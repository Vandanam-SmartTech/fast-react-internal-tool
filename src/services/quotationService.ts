import axios from 'axios';
import { getAuthToken } from './jwtService';
import { getConfig } from '../config';
import { toast } from "react-toastify";
import { BatterySpec } from '../pages/SystemSpecifications/SystemSpecifications';

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



export const generateQuotationPDF = async (selectedSpecId: number, quotationGeneratedDate: Date, quotationNumber: string): Promise<Blob> => {
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
        params: {
          quotationGeneratedDate: formattedDate,
          quotationNumber,
        },
      }
    );

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



export const fetchAllInverterBrands = async (): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get("/api/inverter-brands");
    console.log("Inverter brands:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch inverter brands.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error fetching inverter brands:", error);
    return null;
  }
};

export const fetchAllPipeBrands = async (): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get("/api/pipe-brands");
    console.log("Pipe brands:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch pipe brands.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error fetching pipe brands:", error);
    return null;
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

export const markQuotationFinal = async (requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  if (!requestData?.connectionId) {
    throw new Error("connectionId is missing in requestData!");
  }

  try {
    const response = await quotationAPI.post(`/api/final-quotation`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error marking the quotation final:", error);
    throw new Error("Failed to mark quotation final.");
  }
};

export const fetchFinalQuotationByConnectionId = async (
  connectionId: number
): Promise<{ connectionId: number; quotationId: number }> => {
  const quotationAPI = getQuotationAPI();

  if (!connectionId) {
    throw new Error("connectionId is required!");
  }

  try {
    const response = await quotationAPI.get(
      `/api/final-quotation/${connectionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching final quotation:", error);
    throw error;
  }
};



export const saveSystemSpecPackage = async (requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.post(`/api/system-packages`, requestData);
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

export const updateSelectedBatterySpec = async (selectedBatterySpecId: number, requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  if (!selectedBatterySpecId) {
    throw new Error("Selected battery spec Id is missing for update!");
  }

  try {
    const response = await quotationAPI.put(`/api/org-battery-specs/${selectedBatterySpecId}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error updating selected battery specs:", error);
    throw new Error("Failed to update selected battery specs.");
  }
};

export const updateSelectedPanelSpec = async (selectedPanelSpecId: number, requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  if (!selectedPanelSpecId) {
    throw new Error("Selected panel spec Id is missing for update!");
  }

  try {
    const response = await quotationAPI.put(`/api/org-panel-specs/${selectedPanelSpecId}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error updating selected panel specs:", error);
    throw new Error("Failed to update selected panel specs.");
  }
};

export const updateSelectedInverterSpec = async (selectedInverterSpecId: number, requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  if (!selectedInverterSpecId) {
    throw new Error("Selected inverter spec Id is missing for update!");
  }

  try {
    const response = await quotationAPI.put(`/api/org-inverter-specs/${selectedInverterSpecId}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error updating selected inverter specs:", error);
    throw new Error("Failed to update selected inverter specs.");
  }
};

export const updateSelectedPipeSpec = async (selectedPipeSpecId: number, requestData: any): Promise<any> => {
  const quotationAPI = getQuotationAPI();

  if (!selectedPipeSpecId) {
    throw new Error("Selected pipe spec Id is missing for update!");
  }

  try {
    const response = await quotationAPI.put(`/api/org-pipe-specs/${selectedPipeSpecId}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error updating selected pipe specs:", error);
    throw new Error("Failed to update selected pipe specs.");
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


export const checkFinalQuotationExists = async (
  connectionId: string
): Promise<boolean> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.get(
      `/api/final-quotation/exists/${connectionId}`
    );

    return response.data === true;
  } catch (error) {
    console.error(
      'Error checking final quotation existence for connectionId:',
      error
    );
    return false;
  }
};

export const fetchSelectedBatterySpecs = async (
  orgId: number
): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.get(
      `/api/org-battery-specs/org/${orgId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching selected battery specs", error);
    return [];
  }
};

export const fetchSelectedPanelSpecs = async (
  orgId: number
): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.get(
      "/api/org-panel-specs/org",
      {
        params: {
          orgId: orgId,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching selected panel specs", error);
    return [];
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
  gridTypeId: number,
  orgId: number
): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching inverters...");
    console.log("Request params:", { phaseTypeId, gridTypeId, orgId });

    const response = await quotationAPI.get(`/api/org-inverter-specs/brands`, {
      params: { phaseTypeId, gridTypeId, orgId },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch inverter brands from server");
  }
};


export const fetchInverterBrandCapacities = async (
  inverterBrandId?: number,
  orgId?: number,
  phaseTypeId?: number,
  gridTypeId?: number,
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching inverter capacities...");
    console.log("Request params:", {
      inverterBrandId, orgId, phaseTypeId, gridTypeId
    });

    const response = await quotationAPI.get(`/api/org-inverter-specs`, {
      params: {
        inverterBrandId,
        orgId,
        phaseTypeId,
        gridTypeId
      },
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch inverter brand capacities from server');
  }
};

export const fetchInverterSpecsByBrand = async (
  inverterBrandId: number
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching inverter specs...");
    console.log("Request params:", {
      inverterBrandId
    });

    const response = await quotationAPI.get(`/api/inverter-specs/specs-by-brand`, {
      params: {
        brandId: inverterBrandId
      },
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch inverter brand specs from server');
  }
};

export const fetchPipeSpecsByBrand = async (
  pipeBrandId: number
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching pipe specs...");
    console.log("Request params:", {
      pipeBrandId
    });

    const response = await quotationAPI.get(`/api/pipe-specs/by-brand`, {
      params: {
        pipeBrandId: pipeBrandId
      },
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch pipe brand specs from server');
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

export const fetchPanelSpecsByOrg = async (
  materialOriginId: number,
  orgId: number
): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching panels...");
    console.log("Request params:", { materialOriginId, orgId });

    const response = await quotationAPI.get(`/api/org-panel-specs/org/material-origin`, {
      params: { materialOriginId, orgId },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch panel brands from server");
  }
};

export const fetchPanelBrandCapacities = async (
  phaseTypeId: number,
  orgPanelSpecId: number
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching panel brand capacities...");

    const response = await quotationAPI.get("/api/org-panel-specs/pv-capacity", {
      params: {
        phaseTypeId,
        orgPanelSpecId
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch panel brand capacities from server");
  }
};

export const fetchBatteryBrands = async (
  orgId: number
): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get(
      "/api/org-battery-specs/brands",
      {
        params: { orgId },   // ✅ pass orgId
      }
    );

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

export const fetchAllBatteryBrands = async (): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get(
      "/api/battery-brands"
    );

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
  batteryBrandId: number,
  orgId: number
): Promise<BatterySpec[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching battery brand capacities...");

    const response = await quotationAPI.get("/api/org-battery-specs/specs", {
      params: {
        brandId: batteryBrandId,
        orgId
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch battery brand capacities from server");
  }
};

export const fetchBatterySpecs = async (
  batteryBrandId: number,
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching battery brand capacities...");

    const response = await quotationAPI.get("/api/battery-specs/brands", {
      params: {
        batteryBrandId,
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch battery brand capacities from server");
  }
};

export const updateBatteryBrand = async (brandId: string, updatedName: string) => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.put(`/api/battery-brands/${brandId}`, {
      brandName: updatedName,
    });

    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update brand name");
    return null;
  }
};

export const updatePanelBrand = async (panelBrandId: number, updatedBrandFullname: string, updatedBrandShortname: string) => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.put(`/api/panel-brands/${panelBrandId}`, {
      brandShortname: updatedBrandShortname,
      brandFullname: updatedBrandFullname
    });

    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update brand name");
    return null;
  }
};

export const updateInverterBrand = async (inverterBrandId: number, updatedInverterBrandName: string) => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.put(`/api/inverter-brands/${inverterBrandId}`, {
      inverterBrandName: updatedInverterBrandName
    });

    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update brand name");
    return null;
  }
};

export const updatePipeBrand = async (pipeBrandId: number, updatedPipeName: string) => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.put(`/api/pipe-brands/${pipeBrandId}`, {
      name: updatedPipeName
    });

    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update brand name");
    return null;
  }
};

export const updatePanelType = async (panelTypeId: number, typeName: string, typeDescription: string, typicalEfficiency: string, yearIntroduced: string) => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.put(`/api/panel-types/${panelTypeId}`, {
      typeName: typeName,
      typeDescription: typeDescription,
      typicalEfficiency: Number(typicalEfficiency),
      yearIntroduced: Number(yearIntroduced),
    });

    return response.data;
  } catch (error: any) {
    toast.error("Failed to update brand name", {
      autoClose: 1000,
      hideProgressBar: true
    });
    return null;
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

export const getSavedSystemSpecPackages = async (
  isGharkulPackage?: boolean
): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.get(
      `/api/system-packages/with-specs`,
      {
        params: isGharkulPackage !== undefined
          ? { isGharkulPackage }
          : {}
      }
    );

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

export const fetchPipeSpecification = async (
  orgId: number
): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.get<any[]>(
      "/api/org-pipe-specs",
      {
        params: { orgId },
      }
    );

    console.log("Pipe specs:", response.data);
    return response.data;

  } catch (error: any) {
    // const message =
    //   error?.response?.data?.message || "Failed to fetch pipe specs.";

    // toast.error(message, {
    //   autoClose: 1000,
    //   hideProgressBar: true,
    // });

    console.error("Error fetching pipe specs:", error);

    return []; // ✅ ALWAYS return fallback
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

export const addBatteryBrand = async (data: any): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post("/api/battery-brands", data);
    console.log("Battery brand added:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to add battery brand.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error adding battery brand:", error);
    return null;
  }
};

export const addBatterySpec = async (
  brandId: number,
  data: any
): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post(
      `/api/battery-specs?brandId=${brandId}`,
      data
    );

    console.log("Battery spec added:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to add battery specification.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error adding battery spec:", error);
    return null;
  }
};

export const updateBatterySpec = async (
  specId: number,
  brandId: number,
  data: any
): Promise<any | null> => {

  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.put(
      `/api/battery-specs/${specId}?brandId=${brandId}`,
      data
    );

    console.log("Battery spec updated:", response.data);
    return response.data;

  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Failed to update battery specification.";

    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });

    console.error("Error updating battery spec:", error);
    return null;
  }
};



export const addInverterBrand = async (data: any): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post("/api/inverter-brands", data);
    console.log("Inverter brand added:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to add inverter brand.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error adding inverter brand:", error);
    return null;
  }
};

export const addPipeBrand = async (data: any): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post("/api/pipe-brands", data);
    console.log("Pipe brand added:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to add pipe brand.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error adding pipe brand:", error);
    return null;
  }
};


export const addPanelBrand = async (data: any): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post("/api/panel-brands", data);
    console.log("Panel brand added:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to add panel brand.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error adding panel brand:", error);
    return null;
  }
};

export const addPanelSpec = async (
  brandId: number,
  data: any
): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.post(
      `/api/panel-specs?brandId=${brandId}`,
      data
    );

    console.log("Panel spec added:", response.data);
    return response.data;

  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Failed to add panel specification.";

    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });

    console.error("Error adding panel spec:", error);
    return null;
  }
};

export const addInverterSpec = async (
  data: any
): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.post(
      `/api/inverter-specs`,
      data
    );

    console.log("Inverter spec added:", response.data);
    return response.data;

  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Failed to add inverter specification.";

    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });

    console.error("Error adding inverter spec:", error);
    return null;
  }
};

export const addPipeSpec = async (
  pipeBrandId: number,
  data: any
): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.post(
      `/api/pipe-specs`,
      data,
      {
        params: {
          brandId: pipeBrandId, // ✅ passed as request param
        },
      }
    );

    console.log("Pipe spec added:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Failed to add pipe specification.";

    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });

    console.error("Error adding pipe spec:", error);
    return null;
  }
};


export const addPanelType = async (data: any): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post("/api/panel-types", data);
    console.log("Panel type added:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to add panel type.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error adding panel type:", error);
    return null;
  }
};

export const fetchAllPanelBrands = async (): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get("/api/panel-brands");
    console.log("Panel brands:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch panel brands.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error fetching panel brands:", error);
    return null;
  }
};

export const fetchPanelTypes = async (): Promise<any[] | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get("/api/panel-types");
    console.log("Panel types:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch panel types.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error fetching panel types:", error);
    return null;
  }
};

export const fetchPanelSpecsByBrand = async (
  panelBrandId: number
): Promise<number[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching panel brand capacities...");

    const response = await quotationAPI.get("/api/panel-specs/by-brand", {
      params: {
        panelBrandId
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch panel brand capacities from server");
  }
};

export const updatePanelSpec = async (
  panelSpecId: number,
  data: any
): Promise<any | null> => {

  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.put(
      `/api/panel-specs/${panelSpecId}`,
      data
    );

    console.log("Panel spec updated:", response.data);
    return response.data;

  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Failed to update panel specification.";

    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });

    console.error("Error updating panel spec:", error);
    return null;
  }
};

export const updateInverterSpec = async (
  inverterSpecId: number,
  data: any
): Promise<any | null> => {

  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.put(
      `/api/inverter-specs/${inverterSpecId}`,
      data
    );

    console.log("Inverter spec updated:", response.data);
    return response.data;

  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Failed to update inverter specification.";

    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });

    console.error("Error updating inverter spec:", error);
    return null;
  }
};

export const updatePipeSpec = async (
  pipeSpecId: number,
  pipeBrandId: number,
  data: any
): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();

  try {
    const response = await quotationAPI.put(
      `/api/pipe-specs/${pipeSpecId}`,
      data,
      {
        params: {
          brandId: pipeBrandId, // ✅ passed as request param
        },
      }
    );

    console.log("Pipe spec updated:", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      "Failed to update pipe specification.";

    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });

    console.error("Error updating pipe spec:", error);
    return null;
  }
};


export const addBatterySpecForOrg = async (
  data: any
): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post(
      `/api/org-battery-specs`,
      data
    );

    console.log("Battery spec selected", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to select battery specification.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error selecting battery spec:", error);
    return null;
  }
};

export const addPanelSpecForOrg = async (
  data: any
): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post(
      `/api/org-panel-specs`,
      data
    );

    console.log("Panel spec selected", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to select panel specification.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error selecting panel spec:", error);
    return null;
  }
};

export const addInverterSpecForOrg = async (
  data: any
): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post(
      `/api/org-inverter-specs`,
      data
    );

    console.log("Inverter spec selected", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to select inverter specification.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error selecting inverter spec:", error);
    return null;
  }
};

export const addPipeSpecForOrg = async (
  data: any
): Promise<any | null> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.post(
      `/api/org-pipe-specs`,
      data
    );

    console.log("Pipe spec selected", response.data);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to select pipe specification.";
    toast.error(message, {
      autoClose: 1000,
      hideProgressBar: true,
    });
    console.error("Error selecting pipe spec:", error);
    return null;
  }
};











export const getSystemPackagesWithSpecs = async (
  isGharkulPackage: boolean,
  orgId: number,
  orgPanelSpecId?: number
): Promise<any[]> => {
  const quotationAPI = getQuotationAPI();
  try {
    console.log("Fetching system packages with specs...");
    // console.log("Request params:", { isGharkulPackage, orgId, orgPanelSpecId });

    const response = await quotationAPI.get("/api/system-packages/with-specs", {
      params: {
        isGharkulPackage,
        orgId,
        orgPanelSpecId
      },
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch system packages from server");
  }
};

export const getSystemSpecsById = async (id: number): Promise<any> => {
  const quotationAPI = getQuotationAPI();
  try {
    const response = await quotationAPI.get(`/api/system-specs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching system specs by ID:", error);
    throw new Error("Failed to fetch system specifications.");
  }
};
