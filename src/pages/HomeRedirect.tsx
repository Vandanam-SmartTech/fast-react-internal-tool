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
      if (!claims) {
        setRedirectPath('/login');
        return;
      }

      
      if (!claims.is_password_changed) {
        setRedirectPath('/PasswordReset');
        return;
      }

      
      if (claims.global_roles?.includes('ROLE_SUPER_ADMIN')) {
        setRedirectPath('/SuperAdminDashboard');
        return;
      }

      
      const orgRoles = claims.org_roles ? Object.values(claims.org_roles) : [];

      if (orgRoles.length === 0) {
        setRedirectPath('/login');
        return;
      }

      if (orgRoles.length === 1) {
        
        const orgRole = orgRoles[0];
        const role = orgRole.role;
        
        
        localStorage.setItem(
          'selectedOrg',
          JSON.stringify({ 
            orgId: orgRole.orgId, 
            orgName: orgRole.org_name, 
            role 
          })
        );
        
        routeByOrgRole(role);
        return;
      }

      
      const selectedOrg = localStorage.getItem('selectedOrg');
      if (!selectedOrg) {
        
        setRedirectPath('/login');
        return;
      }

      try {
        const parsedOrg = JSON.parse(selectedOrg);
        routeByOrgRole(parsedOrg.role);
      } catch (error) {
        setRedirectPath('/login');
      }
    };

    const routeByOrgRole = (role: string) => {
      switch (role) {
        case 'ROLE_ORG_ADMIN':
          setRedirectPath('/AdminDashboard');
          break;
        case 'ROLE_AGENCY_ADMIN':
          setRedirectPath('/AgencyAdminDashboard');
          break;
        case 'ROLE_ORG_STAFF':
          setRedirectPath('/StaffDashboard');
          break;
        case 'ROLE_AGENCY_STAFF':
          setRedirectPath('/StaffDashboard');
          break;
        case 'ROLE_ORG_REPRESENTATIVE':
          setRedirectPath('/RepresentativeDashboard');
          break;
        case 'ROLE_AGENCY_REPRESENTATIVE':
          setRedirectPath('/RepresentativeDashboard');
          break;
        case 'ROLE_CUSTOMER':
          setRedirectPath('/manage-customers');
          break;
        default:
          setRedirectPath('/login');
      }
    };

    redirectBasedOnRole();
  }, []);

  if (!redirectPath) return null; 

  return <Navigate to={redirectPath} />;
};

export default HomeRedirect;
