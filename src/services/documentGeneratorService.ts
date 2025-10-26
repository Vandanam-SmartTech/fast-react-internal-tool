import axios from 'axios';
import { getAuthToken } from './jwtService';
import { getConfig } from '../config';

export const getDocumentAPI = () => {
  const { VITE_DOCGENERATOR_API } = getConfig();

  const documentAPI = axios.create({
    baseURL: VITE_DOCGENERATOR_API,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  documentAPI.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return documentAPI;
};

export const fetchPdf = async (
  id: number,
  docName: string,
  quotedTotal?: number
): Promise<Blob> => {
  const documentAPI = getDocumentAPI();

  const endpointMap: Record<string, string> = {
    "WCR": `/api/pdf/wcrUndertakingAdhar/${id}?download=true`,
    "Annexure-I": `/api/pdf/annexureProformaAConverted/${id}?download=true`,
    "Earthing Report": `/api/pdf/earthingPageController/${id}?download=true`,
    "Consumer Vendor Agreement": `/api/pdf/subsidyagreementpageone/${id}?download=true`,
    "Vendor Feasibility": `/api/pdf/vendorFeasibilityController/${id}?download=true`,
    "Net Agreement": `/api/pdf/netAgreementOne/${id}?download=true`,
    "RTS Declaration": `/api/pdf/declarationPage/${id}?download=true`,
  };

  const endpoint = endpointMap[docName];
  if (!endpoint) {
    throw new Error(`No endpoint mapped for document: ${docName}`);
  }

  try {
    if (docName === "Consumer Vendor Agreement") {
      // POST request with body
      const response = await documentAPI.post(
        endpoint,
        { quotedTotal }, // request body
        {
          responseType: "blob",
          headers: { Accept: "application/pdf" },
        }
      );
      return response.data;
    } else {
      // GET for all other documents
      const response = await documentAPI.get(endpoint, {
        responseType: "blob",
        headers: { Accept: "application/pdf" },
      });
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error("Failed to fetch document");
  }
};
