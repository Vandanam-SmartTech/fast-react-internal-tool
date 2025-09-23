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

        // ✅ Global Super Admin → allow access to everything
        if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
          setAuthorized(true);
          return;
        }

        // ✅ Extract orgRoles as entries so we have both orgId & role
        const orgRoles = claims.org_roles ? Object.entries(claims.org_roles) : [];
        if (orgRoles.length === 0) {
          setRedirectPath('/login');
          return;
        }

        // ✅ Validate selectedOrg
        const selectedOrgRaw = localStorage.getItem('selectedOrg');
        if (!selectedOrgRaw) {
          setRedirectPath('/login');
          return;
        }

        try {
          const parsedOrg = JSON.parse(selectedOrgRaw);

          // ✅ Cross-check orgId with claims
          const matchingOrg = orgRoles.find(([orgId]) => orgId === parsedOrg.orgId);

          if (!matchingOrg) {
            console.warn('Selected org not in user claims. Forcing logout.');
            localStorage.removeItem('selectedOrg');
            localStorage.removeItem('jwtToken');
            setRedirectPath('/login');
            return;
          }

          // ✅ Keep selectedOrg in sync with latest claim data
          const [orgId, orgData] = matchingOrg;
          localStorage.setItem(
            'selectedOrg',
            JSON.stringify({
              orgId,
              orgName: orgData.org_name,
              role: orgData.role,
            })
          );

          setAuthorized(true);
        } catch (e) {
          console.error('Failed to parse selectedOrg:', e);
          localStorage.removeItem('selectedOrg');
          setRedirectPath('/login');
        }
      } catch (err) {
        console.error('Error verifying access:', err);
        setRedirectPath('/login');
      }
    };

    verifyAccess();
  }, []);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (authorized === null) {
    return <div>Loading...</div>; // you can replace with a spinner/loader
  }

  return <>{children}</>;
};

export default PrivateRoute;
