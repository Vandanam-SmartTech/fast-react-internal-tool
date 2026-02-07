import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchClaims } from '../services/jwtService';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles, children }) => {
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
      if (!claims) {
        setRedirectPath('/login');
        return;
      }


      if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        if (allowedRoles.includes('ROLE_SUPER_ADMIN')) {
          setAuthorized(true);
        } else {
          setRedirectPath('/super-admin-dashboard');
        }
        return;
      }

      const orgRoles = claims.org_roles ? Object.entries(claims.org_roles) : [];
      if (orgRoles.length === 0) {
        setRedirectPath('/login');
        return;
      }

      const selectedOrgRaw = localStorage.getItem('selectedOrg');
      if (!selectedOrgRaw) {
        setRedirectPath('/login');
        return;
      }

      try {
        const selectedOrg = JSON.parse(selectedOrgRaw);


        const matchingOrg = orgRoles.find(([orgId]) => orgId === selectedOrg.orgId);
        if (!matchingOrg) {

          localStorage.removeItem('jwtToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('selectedOrg');
          setRedirectPath('/login');
          return;
        }

        const [orgId, orgData] = matchingOrg;
        const currentRole =
          selectedOrg.role && orgData.roles.includes(selectedOrg.role)
            ? selectedOrg.role
            : orgData.roles[0];

        
        localStorage.setItem(
          'selectedOrg',
          JSON.stringify({
            orgId,
            orgName: orgData.org_name,
            role: currentRole,
            deptCode: orgData.dept_code ?? null,
          })
        );


        if (allowedRoles.includes(currentRole)) {
          setAuthorized(true);
        } else {
          
          redirectToDashboard(currentRole);
        }
      } catch (err) {
        console.error('Failed to parse selectedOrg:', err);
        localStorage.removeItem('selectedOrg');
        setRedirectPath('/login');
      }
    };

    const redirectToDashboard = (role: string) => {
      switch (role) {
        case 'ROLE_ORG_ADMIN':
          setRedirectPath('/org-admin-dashboard');
          break;
        case 'ROLE_AGENCY_ADMIN':
          setRedirectPath('/agency-admin-dashboard');
          break;
        case 'ROLE_ORG_STAFF':
        case 'ROLE_AGENCY_STAFF':
          setRedirectPath('/staff-dashboard');
          break;
        case 'ROLE_ORG_REPRESENTATIVE':
        case 'ROLE_AGENCY_REPRESENTATIVE':
          setRedirectPath('/representative-dashboard');
          break;
        case 'ROLE_CUSTOMER':
          setRedirectPath('/manage-customers');
          break;
        case 'ROLE_GRAMSEVAK':
          setRedirectPath('/grampanchayat-dashboard');
          break;
        case 'ROLE_BDO':
          setRedirectPath('/bdo-dashboard');
          break;
        default:
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('selectedOrg');
          setRedirectPath('/login');
      }
    };

    checkAccess();
  }, [allowedRoles]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (authorized === null) {
    return null; 
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
