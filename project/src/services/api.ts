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


// Function to fetch cost values based on the provided parameters
export const calculateCosts = async (data: {
  connectionType: string;
  phase: string;
  dcrNonDcr: string;
  kw: number;
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/prices/calculate`, {
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


// Function to fetch panel wattages based on phase type
export const fetchPanelWattages = async (phase: string): Promise<number[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/panelWattages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phase }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch panel wattages');
    }

    return await response.json(); // Assuming the response is a JSON array of numbers
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch panel wattages from server');
  }
};


