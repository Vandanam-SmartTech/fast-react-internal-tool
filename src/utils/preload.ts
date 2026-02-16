export const preloadRoute = (importFn: () => Promise<any>) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  importFn();
};

export const preloadDashboard = (role: string) => {
  const dashboards: Record<string, () => Promise<any>> = {
    ROLE_SUPER_ADMIN: () => import('../pages/Dashboard/SuperAdminDashboard'),
    ROLE_ORG_ADMIN: () => import('../pages/Dashboard/AdminDashboard'),
    ROLE_AGENCY_ADMIN: () => import('../pages/Dashboard/AgencyAdminDashboard'),
    ROLE_ORG_STAFF: () => import('../pages/Dashboard/StaffDashboard'),
    ROLE_AGENCY_STAFF: () => import('../pages/Dashboard/StaffDashboard'),
    ROLE_ORG_REPRESENTATIVE: () => import('../pages/Dashboard/RepresentativeDashboard'),
    ROLE_AGENCY_REPRESENTATIVE: () => import('../pages/Dashboard/RepresentativeDashboard'),
    ROLE_BDO: () => import('../pages/Dashboard/BDODashboard'),
    ROLE_GRAMSEVAK: () => import('../pages/Dashboard/GramPanchayatDashboard')
  };

  const loader = dashboards[role];
  if (loader) {
    requestIdleCallback(() => loader(), { timeout: 2000 });
  }
};

export const preloadCommonRoutes = () => {
  requestIdleCallback(() => {
    import('../pages/Customers/ManageCustomers');
    import('../pages/Profile/Profile');
  }, { timeout: 3000 });
};
