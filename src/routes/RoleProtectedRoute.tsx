import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchClaims } from '../services/jwtService';

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const [authorized, setAuthorized] = useState<null | boolean>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setRedirectPath('/login');
        return;
      }

      const claims = await fetchClaims();
      if (!claims || !claims.roles) {
        setRedirectPath('/login');
        return;
      }

      const userRoles = claims.roles;
      const isAuthorized = allowedRoles.some(role => userRoles.includes(role));

      if (isAuthorized) {
        setAuthorized(true);
      } else {
        if (userRoles.includes('ROLE_REPRESENTATIVE')) {
          setRedirectPath('/RepresentativeDashboard');
        } else if (userRoles.includes('ROLE_ADMIN')) {
          setRedirectPath('/AdminDashboard');
        } else {
          setRedirectPath('/login');
        }
      }
    };

    checkAccess();
  }, [allowedRoles]);

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  if (authorized === null) {
    return null; 
  }

  return children;
};

export default RoleProtectedRoute;
