import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchClaims } from '../services/jwtService';

const PrivateRoute = ({ children }) => {
  const [authorized, setAuthorized] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const verifyAccess = async () => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setRedirectPath('/login');
        return;
      }

      try {
        const claims = await fetchClaims();

        if (!claims || (!claims.global_roles && !claims.org_roles)) {
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
    return <div>Loading...</div>; // Or a spinner
  }

  return children;
};

export default PrivateRoute;
