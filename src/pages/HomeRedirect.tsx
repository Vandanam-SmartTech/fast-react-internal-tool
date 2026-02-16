import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const HomeRedirect: React.FC = () => {
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const { userClaims, loading, setSelectedOrg, clearUserClaims } = useUser();

  useEffect(() => {
    const redirectBasedOnRole = () => {
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

      if (!userClaims.has_password_changed) {
        setRedirectPath('/password-reset');
        return;
      }

      if (userClaims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        setRedirectPath('/super-admin-dashboard');
        return;
      }

      const orgRoles = userClaims.org_roles
        ? Object.entries(userClaims.org_roles)
        : [];

      if (orgRoles.length === 0) {
        setRedirectPath('/login');
        return;
      }

      if (orgRoles.length === 1) {
        const [orgId, orgData] = orgRoles[0];
        const role = orgData.roles[0];

        syncSelectedOrg(orgId, orgData, role);
        routeByRole(role);
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

        const roleToUse =
          parsedOrg.role && orgData.roles.includes(parsedOrg.role)
            ? parsedOrg.role
            : orgData.roles[0];

        syncSelectedOrg(parsedOrg.orgId, orgData, roleToUse);
        routeByRole(roleToUse);
      } catch (error) {
        forceLogout();
      }
    };

    const syncSelectedOrg = (
      orgId: string,
      orgData: any,
      role: string
    ) => {
      const updatedOrg = {
        orgId,
        orgName: orgData.org_name,
        role,
        deptCode: orgData.dept_code ?? null,
      };

      localStorage.setItem('selectedOrg', JSON.stringify(updatedOrg));
      setSelectedOrg(updatedOrg);
    };

    const routeByRole = (role: string) => {
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

    if (!loading) {
      redirectBasedOnRole();
    }
  }, [userClaims, loading]);

  if (loading || !redirectPath) return null;

  return <Navigate to={redirectPath} replace />;
};

export default HomeRedirect;
