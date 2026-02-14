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
      console.log('RoleProtectedRoute: Checking access for roles:', allowedRoles);
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        console.log('RoleProtectedRoute: No token found');
        setRedirectPath('/login');
        return;
      }

      const claims = await fetchClaims();
      console.log('RoleProtectedRoute: Claims received:', claims);
      if (!claims) {
        console.log('RoleProtectedRoute: No claims found');
        setRedirectPath('/login');
        return;
      }


      if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        if (allowedRoles.includes('ROLE_SUPER_ADMIN')) {
          console.log('RoleProtectedRoute: Super admin authorized');
          setAuthorized(true);
        } else {
          console.log('RoleProtectedRoute: Super admin redirecting to dashboard');
          setRedirectPath('/super-admin-dashboard');
        }
        return;
      }

      const orgRoles = claims.org_roles ? Object.entries(claims.org_roles) : [];
      console.log('RoleProtectedRoute: Org roles:', orgRoles);
      if (orgRoles.length === 0) {
        console.log('RoleProtectedRoute: No org roles found');
        setRedirectPath('/login');
        return;
      }

      const selectedOrgRaw = localStorage.getItem('selectedOrg');
      console.log('RoleProtectedRoute: Selected org:', selectedOrgRaw);
      if (!selectedOrgRaw) {
        console.log('RoleProtectedRoute: No selected org');
        setRedirectPath('/login');
        return;
      }

      try {
        const selectedOrg = JSON.parse(selectedOrgRaw);


        const matchingOrg = orgRoles.find(([orgId]) => orgId === selectedOrg.orgId);
        console.log('RoleProtectedRoute: Matching org:', matchingOrg);
        if (!matchingOrg) {

          localStorage.removeItem('jwtToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('selectedOrg');
          console.log('RoleProtectedRoute: No matching org, logging out');
          setRedirectPath('/login');
          return;
        }

        const [orgId, orgData] = matchingOrg;
        const currentRole =
          selectedOrg.role && orgData.roles.includes(selectedOrg.role)
            ? selectedOrg.role
            : orgData.roles[0];

        console.log('RoleProtectedRoute: Current role:', currentRole);
        
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
          console.log('RoleProtectedRoute: User authorized with role:', currentRole);
          setAuthorized(true);
        } else {
          console.log('RoleProtectedRoute: User not authorized, redirecting');
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
