import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchClaims } from "../services/jwtService";

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
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrgState] = useState<SelectedOrg | null>(null);

  /* ===============================
     Refresh Claims
  =============================== */
  const refreshUserClaims = async (): Promise<UserClaims | null> => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        clearUserClaims();
        return null;
      }

      const claims = await fetchClaims();
      setUserClaims(claims);
      return claims;
    } catch (error) {
      console.error("Failed to fetch user claims:", error);
      clearUserClaims();
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Clear User
  =============================== */
  const clearUserClaims = () => {
    setUserClaims(null);
    setSelectedOrgState(null);
    localStorage.removeItem("selectedOrg");
  };

  /* ===============================
     Sync Selected Org to localStorage
  =============================== */
  const setSelectedOrg = (org: SelectedOrg | null) => {
    setSelectedOrgState(org);

    if (org) {
      localStorage.setItem("selectedOrg", JSON.stringify(org));
    } else {
      localStorage.removeItem("selectedOrg");
    }
  };

  /* ===============================
     Restore Selected Org on Load
  =============================== */
  useEffect(() => {
    const storedOrg = localStorage.getItem("selectedOrg");

    if (storedOrg) {
      try {
        const parsed = JSON.parse(storedOrg);
        setSelectedOrgState(parsed);
      } catch {
        localStorage.removeItem("selectedOrg");
      }
    }
  }, []);

  /* ===============================
     Validate Selected Org
  =============================== */
  useEffect(() => {
    if (!userClaims || !selectedOrg?.orgId) return;

    const validOrg = userClaims.org_roles?.[selectedOrg.orgId];

    if (!validOrg) {
      console.warn("Invalid selectedOrg detected. Clearing...");
      setSelectedOrg(null);
    }
  }, [userClaims]);

  /* ===============================
     Initial Claims Load
  =============================== */
  useEffect(() => {
    refreshUserClaims();
  }, []);

  /* ===============================
     Listen for Token Changes (Multi-tab)
  =============================== */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "jwtToken") {
        if (e.newValue) {
          refreshUserClaims();
        } else {
          clearUserClaims();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value: UserContextType = {
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
