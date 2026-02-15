import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const {
    userClaims,
    loading,
    setSelectedOrg,
    clearUserClaims
  } = useUser();

  useEffect(() => {
    
    if (loading) return;

    const token = localStorage.getItem('jwtToken');


    if (!token) {
      setRedirectPath('/login');
      return;
    }

    if (!userClaims) {
      setRedirectPath('/login');
      return;
    }

    if (userClaims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
      setAuthorized(true);
      return;
    }

    const selectedOrgRaw = localStorage.getItem('selectedOrg');

    if (!selectedOrgRaw) {
      setRedirectPath('/login');
      return;
    }

    try {
      const parsedOrg = JSON.parse(selectedOrgRaw);
      const orgData = userClaims.org_roles?.[parsedOrg.orgId];

      if (!orgData) {
        forceLogout();
        return;
      }

      if (!orgData.roles.includes(parsedOrg.role)) {
        forceLogout();
        return;
      }

      setSelectedOrg({
        orgId: parsedOrg.orgId,
        orgName: orgData.org_name,
        role: parsedOrg.role,
        deptCode: orgData.dept_code ?? null,
      });

      setAuthorized(true);
    } catch {
      forceLogout();
    }

  }, [userClaims, loading]);

  const forceLogout = () => {
    localStorage.removeItem('selectedOrg');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');
    clearUserClaims();
    setRedirectPath('/login');
  };

  // if (loading || authorized === null) {
  //   return <div>Loading...</div>;
  // }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
