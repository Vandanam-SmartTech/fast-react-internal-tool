import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const { userClaims, setSelectedOrg, clearUserClaims, loading } = useUser();

  useEffect(() => {
    const checkAccess = () => {
      const token = localStorage.getItem('jwtToken');

      if(loading) return null;

      if (!token) {
        setRedirectPath('/login');
        return;
      }

      if (!userClaims) {
        setRedirectPath('/login');
        return;
      }

      if (userClaims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        if (allowedRoles.includes('ROLE_SUPER_ADMIN')) {
          setAuthorized(true);
        } else {
          setRedirectPath('/super-admin-dashboard');
        }
        return;
      }

      const selectedOrgRaw = localStorage.getItem('selectedOrg');

      if (!selectedOrgRaw) {
        setRedirectPath('/login');
        return;
      }

      try {
        const parsedOrg = JSON.parse(selectedOrgRaw);
        const orgId = parsedOrg.orgId;
        const role = parsedOrg.role;

        const orgData = userClaims.org_roles?.[orgId];

        if (!orgData) {
          forceLogout();
          return;
        }

        const currentRole =
          role && orgData.roles.includes(role)
            ? role
            : orgData.roles[0];

        setSelectedOrg({
          orgId,
          orgName: orgData.org_name,
          role: currentRole,
          deptCode: orgData.dept_code ?? null,
        });

        if (allowedRoles.includes(currentRole)) {
          setAuthorized(true);
        } else {
          redirectToDashboard(currentRole);
        }
      } catch (error) {
        forceLogout();
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
        case 'ROLE_GRAMSEVAK':
          setRedirectPath('/grampanchayat-dashboard');
          break;
        case 'ROLE_BDO':
          setRedirectPath('/bdo-dashboard');
          break;
        default:
          forceLogout();
      }
    };

    const forceLogout = () => {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('selectedOrg');
      clearUserClaims();
      setRedirectPath('/login');
    };

    checkAccess();
  }, [allowedRoles, userClaims]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (authorized === null) {
    return null;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
