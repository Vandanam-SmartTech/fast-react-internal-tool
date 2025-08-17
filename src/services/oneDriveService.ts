import axios from 'axios';
import { getAuthToken, fetchClaims } from './jwtService';
import { getConfig } from '../config';

export const getOneDriveAPI = () => {
  const { VITE_ONEDRIVE_API } = getConfig();

  const oneDriveAPI = axios.create({
    baseURL: VITE_ONEDRIVE_API,
    headers: { 'Content-Type': 'application/json' },
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

export const uploadDocuments = async (
  connectionId: string,
  sessionName: string,
  files: File[]
) => {

  const oneDriveAPI = getOneDriveAPI();
  const claims = await fetchClaims();

  if (!claims?.email_address) {
    throw new Error("Unable to fetch uploader email from claims.");
  }


  const formData = new FormData();

  formData.append("connectionId", connectionId);
  formData.append("folderName", "Onboarding Documents");
  formData.append("sessionName", sessionName);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await oneDriveAPI.post("/api/onedrive/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      "X-Uploaded-By": claims.email_address, 
    },
  });

  return response.data;
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
  const response = await oneDriveAPI.get(`/api/onedrive/download/documentId/${fileId}`, {
    responseType: 'blob',
  });

  return response.data;
};