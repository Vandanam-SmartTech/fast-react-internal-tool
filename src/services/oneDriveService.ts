import axios from 'axios';
import { getAuthToken } from './jwtService';

const oneDriveAPI = axios.create({
  baseURL: `http://${import.meta.env.VITE_DOMAIN_NAME}:${import.meta.env.VITE_ONE_DRIVE_PROD_API_PORT}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

oneDriveAPI.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadDocuments = async (
  connectionId: string,
  sessionName: string,
  files: File[]
) => {
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
      "X-Uploaded-By": "prasad@gmail.com", 
    },
  });

  return response.data;
};

export const fetchUploadedFilesBySession = async (
  connectionId: string,
  session: SessionName
): Promise<UploadedFile[]> => {
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
  const response = await oneDriveAPI.get(`/api/onedrive/download/documentId/${fileId}`, {
    responseType: 'blob',
  });

  return response.data;
};
