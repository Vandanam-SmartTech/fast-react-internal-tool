import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchClaims } from '../services/jwtService';

interface UserClaims {
  name?: string;
  preferred_name?: string;
  email?: string;
  global_roles?: string[];
  org_roles?: Record<string, any>;
  is_password_changed?: boolean;
  [key: string]: any;
}

interface UserContextType {
  userClaims: UserClaims | null;
  loading: boolean;
  refreshUserClaims: () => Promise<void>;
  clearUserClaims: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserClaims = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setUserClaims(null);
        return;
      }

      const claims = await fetchClaims();
      setUserClaims(claims);
    } catch (error) {
      console.error('Failed to fetch user claims:', error);
      setUserClaims(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUserClaims = () => {
    setUserClaims(null);
  };

  useEffect(() => {
    refreshUserClaims();
  }, []);

  // Listen for storage changes (when login/logout happens)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwtToken') {
        if (e.newValue) {
          refreshUserClaims();
        } else {
          clearUserClaims();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Also listen for custom events for immediate updates
  useEffect(() => {
    const handleUserUpdate = () => {
      refreshUserClaims();
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

  const value = {
    userClaims,
    loading,
    refreshUserClaims,
    clearUserClaims,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
