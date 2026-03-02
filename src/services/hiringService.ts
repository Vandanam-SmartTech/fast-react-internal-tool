import { getConfig } from '../config';

const getApiBaseUrl = () => getConfig().VITE_HIRING_API;


export const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = '',
  workingStyle: string = '',
  workerType: string = ''
) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/users/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        limit,
        searchTerm,
        workingStyle,
        workerType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id: number | string) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const downloadDocumentById = async (id: number): Promise<Blob> => {
  const response = await fetch(
    `${getApiBaseUrl()}/api/user-documents/${id}/download`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to download document");
  }

  return await response.blob();
};

export const getUserCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/users/count`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user count');
    }

    const count: number = await response.json();
    return count;
  } catch (error) {
    console.error('Error fetching user count:', error);
    throw error;
  }
};