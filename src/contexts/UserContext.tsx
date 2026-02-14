import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchClaims } from '../services/jwtService';


interface SelectedOrg {
  orgId?: string;
  orgName: string;
  role: string;
  deptCode: number | null;
}

interface OrgRole {
  roles: string[];
  org_name: string;
  dept_code: number | null;
}

interface UserClaims {
  id: number;
  name_as_per_gov_id?: string;
  preferred_name?: string;
  email_address?: string;
  user_code?: string;
  username?: string;
  contact_number?: string;
  global_roles?: string[];
  org_roles?: Record<string, OrgRole>;
  has_password_changed?: boolean;
  [key: string]: any; 
}

interface UserContextType {
  userClaims: UserClaims | null;
  loading: boolean;
  refreshUserClaims: () => Promise<UserClaims | null>;
  clearUserClaims: () => void;
  selectedOrg: SelectedOrg | null;
  setSelectedOrg: (org: SelectedOrg | null) => void;
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
  const [selectedOrg, setSelectedOrg] = useState<SelectedOrg | null>(null);

  const refreshUserClaims = async (): Promise<UserClaims | null> => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setUserClaims(null);
        setLoading(false);
        return null;
      }

      const claims = await fetchClaims(false); // Use cache
      setUserClaims(claims);
      return claims; 
    } catch {
      setUserClaims(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearUserClaims = () => {
    setUserClaims(null);
    setSelectedOrg(null);
  };

  useEffect(() => {
    refreshUserClaims();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwtToken') {
        e.newValue ? refreshUserClaims() : clearUserClaims();
      }
    };

    const handleUserUpdate = () => refreshUserClaims();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);



  const value = {
    userClaims,
    loading,
    refreshUserClaims,
    clearUserClaims,
    selectedOrg,
    setSelectedOrg,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
