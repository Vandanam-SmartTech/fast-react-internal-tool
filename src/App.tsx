import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense } from "react";
import { UserProvider } from './contexts/UserContext';
import Login from './pages/Auth/Login';
import HomeRedirect from './pages/HomeRedirect';
import * as LazyRoutes from './utils/lazyRoutes';
import { preloadDashboard, preloadCommonRoutes } from './utils/preload';

const Loader = () => <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

const AppContent: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const authPages = ['/login', '/password-reset', '/verification', '/change-password', '/page-not-found'];
  const showSidebar = !authPages.includes(location.pathname);

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', newState.toString());
      return newState;
    });
  };

  useEffect(() => {
    const storedState = localStorage.getItem('sidebarOpen');
    setSidebarOpen(storedState === 'true');

    const userRole = localStorage.getItem('userRole');
    if (userRole) {
      preloadDashboard(userRole);
      preloadCommonRoutes();
    }
    
    const handleStorageChange = () => {
      const newState = localStorage.getItem('sidebarOpen');
      setSidebarOpen(newState === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 flex flex-col transition-colors duration-200">
      {/* Sidebar - Always render but control visibility */}
      <Suspense fallback={null}>
        <LazyRoutes.Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        {showSidebar && <LazyRoutes.Header />}
        <LazyRoutes.ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg shadow-soft"
        />
        <LazyRoutes.EnvBanner />
      </Suspense>

      {/* Main content area */}
      <main className={`flex-1 transition-all duration-300 ${
        showSidebar && sidebarOpen ? 'md:ml-64' : ''
      }`}>
        <div className={`${showSidebar ? 'pt-16 md:pt-20' : ''}`}>
          <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/password-reset" element={<LazyRoutes.PasswordReset />} />
            <Route path="/verification" element={<LazyRoutes.Verification />} />
            <Route path="/change-password" element={<LazyRoutes.ChangePassword />} />
            
            
            <Route
              path="/profile"
              element={
                <LazyRoutes.PrivateRoute>
                  <LazyRoutes.Profile />
                </LazyRoutes.PrivateRoute>
              }
            />
            
            <Route path="*" element={<LazyRoutes.PageNotFound />} />

            {/* Customer Management Routes */}
            <Route
              path="/manage-customers"
              element={
                <LazyRoutes.PrivateRoute>
                  <LazyRoutes.ManageCustomers />
                </LazyRoutes.PrivateRoute>
              }
            />

            <Route
              path="/list-of-consumers"
              element={
                <LazyRoutes.PrivateRoute>
                  <LazyRoutes.ListOfConsumers />
                </LazyRoutes.PrivateRoute>
              }
            />

          

            {/* Dashboard Routes */}
            <Route
              path="/org-admin-dashboard"
              element={
                <LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_ORG_ADMIN']}>
                  <LazyRoutes.AdminDashboard />
                </LazyRoutes.RoleProtectedRoute>
              }
            />

            <Route
              path="/bdo-dashboard"
              element={
                <LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_BDO']}>
                  <LazyRoutes.BDODashboard />
                </LazyRoutes.RoleProtectedRoute>
              }
            />

            <Route
              path="/grampanchayat-dashboard"
              element={
                <LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_GRAMSEVAK']}>
                  <LazyRoutes.GramPanchayatDashboard />
                </LazyRoutes.RoleProtectedRoute>
              }
            />

            <Route
              path="/super-admin-dashboard"
              element={
                <LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <LazyRoutes.SuperAdminDashboard />
                </LazyRoutes.RoleProtectedRoute>
              }
            />

            <Route
              path="/representative-dashboard"
              element={
                <LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_ORG_REPRESENTATIVE','ROLE_AGENCY_REPRESENTATIVE']}>
                  <LazyRoutes.RepresentativeDashboard />
                </LazyRoutes.RoleProtectedRoute>
              }
            />

            <Route
              path="/agency-admin-dashboard"
              element={
                <LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_AGENCY_ADMIN']}>
                  <LazyRoutes.AgencyAdminDashboard />
                </LazyRoutes.RoleProtectedRoute>
              }
            />

            <Route
              path="/staff-dashboard"
              element={
                <LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_ORG_STAFF','ROLE_AGENCY_STAFF']}>
                  <LazyRoutes.StaffDashboard />
                </LazyRoutes.RoleProtectedRoute>
              }
            />

            {/* Document Routes */}
            <Route
              path="/generate-documents"
              element={
                <LazyRoutes.PrivateRoute>
                  <LazyRoutes.GenerateDocuments />
                </LazyRoutes.PrivateRoute>
              }
            />


            {/* Customer Routes */}
            <Route path="/view-customer" element={<LazyRoutes.PrivateRoute><LazyRoutes.ViewCustomer /></LazyRoutes.PrivateRoute>} />
            <Route path="/edit-customer" element={<LazyRoutes.PrivateRoute><LazyRoutes.EditCustomer /></LazyRoutes.PrivateRoute>} />
            <Route path="/customer-form" element={<LazyRoutes.PrivateRoute><LazyRoutes.CustomerForm /></LazyRoutes.PrivateRoute>} />

            {/* Connection Routes */}
            <Route path="/edit-connection" element={<LazyRoutes.PrivateRoute><LazyRoutes.EditConnection /></LazyRoutes.PrivateRoute>} />
            <Route path="/view-connection" element={<LazyRoutes.PrivateRoute><LazyRoutes.ViewConnection /></LazyRoutes.PrivateRoute>} />
            <Route path="/connection-form" element={<LazyRoutes.PrivateRoute><LazyRoutes.ConnectionForm /></LazyRoutes.PrivateRoute>} />

            {/* Installation Routes */}
            <Route path="/edit-installation" element={<LazyRoutes.PrivateRoute><LazyRoutes.EditInstallation /></LazyRoutes.PrivateRoute>} />
            <Route path="/view-installation" element={<LazyRoutes.PrivateRoute><LazyRoutes.ViewInstallation /></LazyRoutes.PrivateRoute>} />
            <Route path="/installation-form" element={<LazyRoutes.PrivateRoute><LazyRoutes.InstallationForm /></LazyRoutes.PrivateRoute>} />

            {/* System Routes */}
            <Route path="/system-specifications" element={<LazyRoutes.PrivateRoute><LazyRoutes.SystemSpecifications /></LazyRoutes.PrivateRoute>} />
            <Route path="/onboarded-consumers" element={<LazyRoutes.PrivateRoute><LazyRoutes.OnboardedConsumers /></LazyRoutes.PrivateRoute>} />

            {/* Material Routes */}
            <Route path="/material-form" element={<LazyRoutes.PrivateRoute><LazyRoutes.MaterialDetails /></LazyRoutes.PrivateRoute>} />

            {/* Organization Routes */}
            <Route path="/organizations" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}><LazyRoutes.OrganizationList /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/organization-form" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}><LazyRoutes.OrganizationForm /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/edit-organization" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN','ROLE_ORG_ADMIN']}><LazyRoutes.EditOrganization /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/edit-agency" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN','ROLE_ORG_ADMIN','ROLE_AGENCY_ADMIN']}><LazyRoutes.EditAgency /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/admin-management" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN','ROLE_ORG_ADMIN']}><LazyRoutes.AdminManagement /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/agencies" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN']}><LazyRoutes.AgencyList /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/agency-form" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN']}><LazyRoutes.AgencyForm /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/organization-view" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}><LazyRoutes.OrganizationView /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/agency-view" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}><LazyRoutes.AgencyView /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/user-management" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}><LazyRoutes.UserManagement /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/package-management" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}><LazyRoutes.PackageManagement /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/product-management" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}><LazyRoutes.ProductManagement /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/user-form" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}><LazyRoutes.UserFormManagement /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/edit-user" element={<LazyRoutes.PrivateRoute><LazyRoutes.EditUser /></LazyRoutes.PrivateRoute>} />
            <Route path="/user-view" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}><LazyRoutes.UserView /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/role-management/:id" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN']}><LazyRoutes.RoleManagement /></LazyRoutes.RoleProtectedRoute>} />
            <Route path="/user-org-roles" element={<LazyRoutes.RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN','ROLE_AGENCY_ADMIN']}><LazyRoutes.UserOrgRoles /></LazyRoutes.RoleProtectedRoute>} />
          </Routes>
          </Suspense>
        </div>
      </main>
      
      
      {showSidebar && <LazyRoutes.Footer />}
    </div>
  );
};

function App({ basePath }: { basePath: string }) {
  return (
    <UserProvider>
      <Router basename={basePath}>
        <LazyRoutes.ScrollToTop />
        <AppContent />
      </Router>
    </UserProvider>
  );
}


export default App;
