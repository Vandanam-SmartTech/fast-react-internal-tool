import axios from 'axios';
import { getAuthToken } from './jwtService';

const docGeneratorAPI = axios.create({
  baseURL: `${import.meta.env.VITE_DOCUMENT_API}`,
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

export const fetchPdf = async (id: number, docName: string): Promise<Blob> => {
  let endpoint = "";

  switch (docName) {
    case "WCR Page-1":
      endpoint = `/api/pdf/wcrUndertakingAdhar/${id}?download=true`;
      break;
    case "Annexure 1":
      endpoint = `/api/pdf/annexureProformaAConverted/${id}?download=true`;
      break;
    case "EarthingPageDocument":
      endpoint = `/api/pdf/earthingPageController/${id}?download=true`;
      break;
    case "Subsidy Agreement Document-Page-1":
      endpoint = `/api/pdf/subsidyagreementpageone/${id}?download=true`;
      break;
    case "Subsidy Agreement Document-Page-2":
      endpoint = `/api/pdf/subsidyAgreementPageTwo/${id}?download=true`;
      break;
    case "Vendor Feasibility Document":
      endpoint = `/api/pdf/vendorFeasibilityController/${id}?download=true`;
      break;
    case "Netmeter Agreement Document-Page-1":
      endpoint = `/api/pdf/netAgreementOne/${id}?download=true`;
      break;
    case "Netmeter Agreement Document-Page-2":
      endpoint = `/api/pdf/netAgreementTwo/${id}?download=true`;
      break;
    case "Declaration Page":
    case "Declarartion Document": // Typo handled here
      endpoint = `/api/pdf/declarationPage/${id}?download=true`;
      break;
    default:
      throw new Error(`Unknown document name: ${docName}`);
  }

  try {
    const response = await docGeneratorAPI.get(endpoint, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw new Error("Failed to fetch document");
  }
};