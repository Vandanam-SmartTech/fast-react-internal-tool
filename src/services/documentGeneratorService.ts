import axios from 'axios';
import { getAuthToken } from './jwtService';
import { getConfig } from '../config';

export const getDocumentAPI = () => {
  const { VITE_DOCUMENT_API } = getConfig();

  const documentAPI = axios.create({
    baseURL: VITE_DOCUMENT_API,
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

export const fetchPdf = async (id: number, docName: string): Promise<Blob> => {
  const documentAPI = getDocumentAPI();

  // map UI names → API endpoints
  const endpointMap: Record<string, string> = {
    "WCR": `/api/pdf/wcrUndertakingAdhar/${id}?download=true`,
    "Annexure-I": `/api/pdf/annexureProformaAConverted/${id}?download=true`,
    "Earthing": `/api/pdf/earthingPageController/${id}?download=true`,
    "Subsidy Document": `/api/pdf/subsidyagreementpageone/${id}?download=true`,
    "Vendor Feasibility": `/api/pdf/vendorFeasibilityController/${id}?download=true`,
    "Net Agreement": `/api/pdf/netAgreementOne/${id}?download=true`, // if you have 2 pages, adjust
    "Declaration": `/api/pdf/declarationPage/${id}?download=true`,
    "DCR Certificate": `/api/pdf/dcrCertificate/${id}?download=true`, // example, adjust to your BE
    "Quotation": `/api/pdf/quotation/${id}?download=true` // example, adjust
  };

  const endpoint = endpointMap[docName];
  if (!endpoint) {
    throw new Error(`No endpoint mapped for document: ${docName}`);
  }

  try {
    const response = await documentAPI.get(endpoint, {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error("Failed to fetch document");
  }
};
