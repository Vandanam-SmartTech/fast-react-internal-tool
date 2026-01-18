import axios from 'axios';
import { getAuthToken } from './jwtService';
import { getConfig } from '../config';

export const getDocGeneratorAPI = () => {
  const { VITE_DOCGENERATOR_API } = getConfig();

  const docGeneratorAPI = axios.create({
    baseURL: VITE_DOCGENERATOR_API,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  docGeneratorAPI.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return docGeneratorAPI;
};

export const fetchPdf = async (
  id: number,
  docName: string,
  quotedTotal?: number
): Promise<Blob> => {
  const docGeneratorAPI = getDocGeneratorAPI();

  const endpointMap: Record<string, string> = {
    "WCR Draft": `/api/pdf/wcrUndertakingAdhar/${id}?download=true`,
    "Annexure-I Draft": `/api/pdf/annexureProformaAConverted/${id}?download=true`,
    "Earthing Report": `/api/pdf/earthingPageController/${id}?download=true`,
    "Consumer Vendor Agreement Draft": `/api/pdf/subsidyagreementpageone/${id}?download=true`,
    "Vendor Feasibility": `/api/pdf/vendorFeasibilityController/${id}?download=true`,
    "Net Agreement Draft": `/api/pdf/netAgreementOne/${id}?download=true`,
    "RTS Declaration Draft": `/api/pdf/declarationPage/${id}?download=true`,
    "Gen Meter Testing Letter": `/api/pdf/genMeterLetter/${id}?download=true`,
  };

  const endpoint = endpointMap[docName];
  if (!endpoint) {
    throw new Error(`No endpoint mapped for document: ${docName}`);
  }

  try {
    if (docName === "Consumer Vendor Agreement Draft") {
      // POST request with body
      const response = await docGeneratorAPI.post(
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
      const response = await docGeneratorAPI.get(endpoint, {
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
