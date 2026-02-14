import axios from 'axios';
import { getConfig } from '../config';
import { fetchClaims } from './jwtService';

export const getDocManagerAPI = () => {
  const { VITE_DOCMANAGER_API } = getConfig();

  const docManagerAPI = axios.create({
    baseURL: VITE_DOCMANAGER_API,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  docManagerAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return docManagerAPI;
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
    const docManagerAPI = getDocManagerAPI();

    const formData = new FormData();
    formData.append('connectionId', connectionId);
    formData.append('documentType', documentType);
    formData.append('documentData', file);

    const response = await docManagerAPI.post('/api/document-manager/documents/', formData);
    return response.data;
  } catch (error: any) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const fetchUploadedDocuments = async (connectionId: string) => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const response = await docManagerAPI.get(`/api/document-manager/documents/data/${connectionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch documents:', error);
    throw error;
  }
};

export const fetchUploadedDocumentByDocumentTypeAndDocumentNumber = async (
  connectionId: string,
  documentType?: string,
  secondaryId?: string
) => {
  try {
    const docManagerAPI = getDocManagerAPI();

    const response = await docManagerAPI.get(
      `/api/document-manager/documents/${connectionId}`,
      {
        params: {
          documentType,
          secondaryId,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch documents:", error);
    throw error;
  }
};

export const downloadDocumentById = async (id: number): Promise<Blob> => {
  const docManagerAPI = getDocManagerAPI();
  const response = await docManagerAPI.get(`/api/document-manager/documents/download/${id}`, {
    responseType: 'blob',
  });

  return response.data;
};

export const deleteDocumentById = async (id:number): Promise<void> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    await docManagerAPI.delete(`/api/document-manager/documents/delete/${id}`);
  } catch (error: any) {
    console.error('Failed to delete document:', error);
    throw error;
  }
};

export const updateDocumentById = async (id:number, file: File): Promise<void> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const formData = new FormData();

    formData.append("fileId", id);
    formData.append("fileData", file);

    await docManagerAPI.put(`/api/document-manager/documents/update/${id}`, formData);
  } catch (error: any) {
    console.error("Failed to update document:", error);
    throw error;
  }
};

export const uploadUserSignature = async (file: File): Promise<void> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const claims = await fetchClaims();
    const userId = claims.id;

    const formData = new FormData();
    formData.append("filedata", file);

    await docManagerAPI.post(`/api/document-manager/user-media/${userId}/signature`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: any) {
    console.error("Failed to upload signature:", error);
    throw error;
  }
};

export const getUserSignature = async (): Promise<string | null> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const claims = await fetchClaims();
    const userId = claims.id;

    const res = await docManagerAPI.get(
      `/api/document-manager/user-media/${userId}/signature`,
      { responseType: "blob" }
    );

    return URL.createObjectURL(res.data);
  } catch (error: any) {
    // Silently handle 404/500 errors - user may not have a signature
    if (error.response?.status === 404 || error.response?.status === 500) {
      return null;
    }
    console.error("Failed to fetch signature:", error);
    return null;
  }
};

export const editUserSignature = async (file: File): Promise<void> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const claims = await fetchClaims();
    const userId = claims.id;

    const formData = new FormData();
    formData.append("filedata", file);

    await docManagerAPI.put(
      `/api/document-manager/user-media/${userId}/signature`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to edit signature:", error);
    throw error;
  }
};

export const deleteUserSignaturePhoto = async (): Promise<void> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const claims = await fetchClaims();
    const userId = claims.id;

    await docManagerAPI.delete(`/api/document-manager/user-media/${userId}`, {
      params: { type: "SIGNATURE" },
    });

    console.log("Profile photo deleted successfully");
  } catch (error: any) {
    console.error("Failed to delete profile photo:", error);
    throw error;
  }
};

export const uploadUserProfilePhoto = async (file: File): Promise<void> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const claims = await fetchClaims();
    const userId = claims.id;

    const formData = new FormData();
    formData.append("filedata", file);

    await docManagerAPI.post(`/api/document-manager/user-media/${userId}/profile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error: any) {
    console.error("Failed to upload signature:", error);
    throw error;
  }
};

export const getUserProfilePhoto = async (): Promise<string | null> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const claims = await fetchClaims();
    const userId = claims.id;

    const res = await docManagerAPI.get(
      `/api/document-manager/user-media/${userId}/profile`,
      { responseType: "blob" }
    );

    return URL.createObjectURL(res.data);
  } catch (error: any) {
    // Silently handle 404/500 errors - user may not have a profile photo
    if (error.response?.status === 404 || error.response?.status === 500) {
      return null;
    }
    console.error("Failed to fetch profile photo:", error);
    return null;
  }
};

export const editUserProfilePhoto = async (file: File): Promise<void> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const claims = await fetchClaims();
    const userId = claims.id;

    const formData = new FormData();
    formData.append("filedata", file);

    await docManagerAPI.put(
      `/api/document-manager/user-media/${userId}/profile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to edit signature:", error);
    throw error;
  }
};

export const deleteUserProfilePhoto = async (): Promise<void> => {
  try {
    const docManagerAPI = getDocManagerAPI();
    const claims = await fetchClaims();
    const userId = claims.id;

    // Add ?type=PROFILE (or lowercase "profile" if your MediaTypes enum handles it case-insensitively)
    await docManagerAPI.delete(`/api/document-manager/user-media/${userId}`, {
      params: { type: "PROFILE" },
    });

    console.log("Profile photo deleted successfully");
  } catch (error: any) {
    console.error("Failed to delete profile photo:", error);
    throw error;
  }
};



export const uploadOrganizationImage = async (orgId: number, file: File): Promise<void> => {
  try {
    const docManagerAPI = getDocManagerAPI();

    const formData = new FormData();
    formData.append("file", file);

    await docManagerAPI.post(`/api/document-manager/organization-media/${orgId}/logo`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(`Logo uploaded successfully for organization ${orgId}`);
  } catch (error: any) {
    console.error("Failed to upload logo:", error);
    throw error;
  }
};

export const fetchOrganizationImage = async (orgId: number): Promise<string | null> => {
  try {
    const docManagerAPI = getDocManagerAPI();

    const response = await docManagerAPI.get(
      `/api/document-manager/organization-media/${orgId}/logo/image`,
      {
        responseType: "blob", 
      }
    );

    const imageUrl = URL.createObjectURL(response.data);
    return imageUrl;
  } catch (error: any) {
    // Silently handle 404/500 errors - organization may not have a logo
    if (error.response?.status === 404 || error.response?.status === 500) {
      return null;
    }
    console.error("Failed to fetch logo:", error);
    return null;
  }
};

