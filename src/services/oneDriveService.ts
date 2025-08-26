import axios from 'axios';
// Note: auth helpers unused here; token is read from localStorage in interceptor
import { getConfig } from '../config';

export const getOneDriveAPI = () => {
  const { VITE_DOCMANAGER_API } = getConfig();

  const oneDriveAPI = axios.create({
    baseURL: VITE_DOCMANAGER_API,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  oneDriveAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return oneDriveAPI;
};

// Local types for helper endpoints
type SessionName = string;
interface UploadedFile {
  fileId: string;
  fileName: string;
  filePath: string;
}

export const uploadDocuments = async (
  connectionId: string,
  documentType: string,
  file: File
) => {
  try {
    const onedriveAPI = getOneDriveAPI();

    const formData = new FormData();
    formData.append('connectionId', connectionId);
    formData.append('documentType', documentType);
    formData.append('documentData', file);

    const response = await onedriveAPI.post('/api/document-manager/documents/', formData);
    return response.data;
  } catch (error: any) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const fetchUploadedDocuments = async (connectionId: string) => {
  try {
    const onedriveAPI = getOneDriveAPI();
    const response = await onedriveAPI.get(`/api/document-manager/documents/data/${connectionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch documents:', error);
    throw error;
  }
};

export const fetchUploadedFilesBySession = async (
  connectionId: string,
  session: SessionName
): Promise<UploadedFile[]> => {
  const oneDriveAPI = getOneDriveAPI();
  try {
    const response = await oneDriveAPI.get(`/api/onedrive/metadata/${connectionId}/${session}`);

    const files = response.data?.data || [];

    return files.map((file: any) => ({
      fileId: file.fileId,
      fileName: file.fileName,
      filePath: file.filePath,
    }));
  } catch (error) {
    console.error(`Error fetching files for ${session}`, error);
    return [];
  }
};

export const downloadDocumentById = async (fileId: string): Promise<Blob> => {
  const oneDriveAPI = getOneDriveAPI();
  const response = await oneDriveAPI.get(`/api/document-manager/documents/download/${fileId}`, {
    responseType: 'blob',
  });

  return response.data;
};

export const deleteDocumentById = async (fileId: string): Promise<void> => {
  try {
    const oneDriveAPI = getOneDriveAPI();
    await oneDriveAPI.delete(`/api/document-manager/documents/${fileId}`);
  } catch (error: any) {
    console.error('Failed to delete document:', error);
    throw error;
  }
};

export const updateDocumentById = async (fileId: string, file: File): Promise<void> => {
  try {
    const oneDriveAPI = getOneDriveAPI();
    const formData = new FormData();
    formData.append('documentData', file);
    await oneDriveAPI.put(`/api/document-manager/documents/${fileId}`, formData);
  } catch (error: any) {
    console.error('Failed to update document:', error);
    throw error;
  }
};