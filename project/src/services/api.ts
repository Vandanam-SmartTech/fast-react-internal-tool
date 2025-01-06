import { QuotationData } from '../types/quotation';


const API_BASE_URL = 'http://localhost:7575/api';

export const generateQuotationPDF = async (data: QuotationData): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}/quotations/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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


const API_BASE_URL2 = 'http://localhost:7575/api';

// Function to fetch cost values based on the provided parameters
export const calculateCosts = async (data: {
  connectionType: string;
  phase: string;
  dcrNonDcr: string;
  kw: number;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL2}/prices/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

