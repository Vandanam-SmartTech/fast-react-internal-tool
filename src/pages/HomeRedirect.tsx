// pages/HomeRedirect.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchClaims } from '../services/jwtService';

const HomeRedirect: React.FC = () => {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const redirectBasedOnRole = async () => {
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

      const roles = claims.roles;

      const isPasswordChanged = claims.is_password_changed;

      if (!isPasswordChanged) {
    
      setRedirectPath('/PasswordReset');
      return;
      }

      if (roles.includes('ROLE_ADMIN')) {
        setRedirectPath('/AdminDashboard');
      } else if (roles.includes('ROLE_REPRESENTATIVE')) {
        setRedirectPath('/RepresentativeDashboard');
      } else {
        setRedirectPath('/login');
      }
    };

    redirectBasedOnRole();
  }, []);

  if (!redirectPath) return null; // or a loading spinner

  return <Navigate to={redirectPath} />;
};

export default HomeRedirect;
