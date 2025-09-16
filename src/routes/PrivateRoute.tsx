import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchClaims } from '../services/jwtService';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const verifyAccess = async () => {
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setRedirectPath('/login');
        return;
      }

      try {
        const claims = await fetchClaims();
        if (!claims) {
          setRedirectPath('/login');
          return;
        }

        if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
          setAuthorized(true);
          return;
        }

        const orgRoles = claims.org_roles ? Object.values(claims.org_roles) : [];
        if (orgRoles.length === 0) {
          setRedirectPath('/login');
          return;
        }

        
        if (!localStorage.getItem('selectedOrg')) {
          setRedirectPath('/login');
          return;
        }

        setAuthorized(true);
      } catch (err) {
        setRedirectPath('/login');
      }
    };

    verifyAccess();
  }, []);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (authorized === null) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default PrivateRoute;
