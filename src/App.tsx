import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from "react";
import { UserProvider } from './contexts/UserContext';
import Login from './pages/Auth/Login';
import HomeRedirect from './pages/HomeRedirect';

const ScrollToTop = lazy(() => import('./components/ScrollToTop'));
const PrivateRoute = lazy(() => import('./routes/PrivateRoute'));
const RoleProtectedRoute = lazy(() => import('./routes/RoleProtectedRoute'));
const Sidebar = lazy(() => import('./components/Sidebar'));
const ToastContainer = lazy(() => import('react-toastify').then(m => ({ default: m.ToastContainer })));
const PageNotFound = lazy(() => import('./pages/PageNotFound'));
const EnvBanner = lazy(() => import('./components/EnvBanner'));
const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));

const PasswordReset = lazy(() => import('./pages/Auth/PasswordReset'));
const Verification = lazy(() => import('./pages/Auth/Verification'));
const ChangePassword = lazy(() => import('./pages/Auth/ChangePassword'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const ManageCustomers = lazy(() => import('./pages/Customers/ManageCustomers'));
const ListOfConsumers = lazy(() => import('./pages/ConsumerList/ListOfConsumers').then(m => ({ default: m.ListOfConsumers })));
const AdminDashboard = lazy(() => import('./pages/Dashboard/AdminDashboard'));
const BDODashboard = lazy(() => import('./pages/Dashboard/BDODashboard'));
const GramPanchayatDashboard = lazy(() => import('./pages/Dashboard/GramPanchayatDashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/Dashboard/SuperAdminDashboard'));
const RepresentativeDashboard = lazy(() => import('./pages/Dashboard/RepresentativeDashboard'));
const AgencyAdminDashboard = lazy(() => import('./pages/Dashboard/AgencyAdminDashboard'));
const StaffDashboard = lazy(() => import('./pages/Dashboard/StaffDashboard'));
const GenerateDocuments = lazy(() => import('./pages/Documents/GenerateDocuments'));
const ViewCustomer = lazy(() => import('./pages/Customers/ViewCustomer').then(m => ({ default: m.ViewCustomer })));
const EditCustomer = lazy(() => import('./pages/Customers/EditCustomer').then(m => ({ default: m.EditCustomer })));
const CustomerForm = lazy(() => import('./pages/Customers/CustomerForm').then(m => ({ default: m.CustomerForm })));
const EditConnection = lazy(() => import('./pages/Connections/EditConnection').then(m => ({ default: m.EditConnection })));
const ViewConnection = lazy(() => import('./pages/Connections/ViewConnection').then(m => ({ default: m.ViewConnection })));
const ConnectionForm = lazy(() => import('./pages/Connections/ConnectionForm').then(m => ({ default: m.ConnectionForm })));
const EditInstallation = lazy(() => import('./pages/Installations/EditInstallation').then(m => ({ default: m.EditInstallation })));
const ViewInstallation = lazy(() => import('./pages/Installations/ViewInstallation').then(m => ({ default: m.ViewInstallation })));
const InstallationForm = lazy(() => import('./pages/Installations/InstallationForm').then(m => ({ default: m.InstallationForm })));
const SystemSpecifications = lazy(() => import('./pages/SystemSpecifications/SystemSpecifications').then(m => ({ default: m.SystemSpecifications })));
const OnboardedConsumers = lazy(() => import('./pages/ConsumerList/OnboardedConsumers'));
const MaterialDetails = lazy(() => import('./pages/Materials/MaterialDetails'));
const OrganizationList = lazy(() => import('./pages/Organizations/OrganizationList'));
const OrganizationForm = lazy(() => import('./pages/Organizations/OrganizationForm'));
const EditOrganization = lazy(() => import('./pages/Organizations/EditOrganization'));
const EditAgency = lazy(() => import('./pages/Agencies/EditAgency'));
const AdminManagement = lazy(() => import('./pages/Organizations/AdminManagement'));
const AgencyList = lazy(() => import('./pages/Agencies/AgencyList'));
const AgencyForm = lazy(() => import('./pages/Agencies/AgencyForm'));
const OrganizationView = lazy(() => import('./pages/Organizations/OrganizationView'));
const AgencyView = lazy(() => import('./pages/Agencies/AgencyView'));
const UserManagement = lazy(() => import('./pages/Organizations/UserManagement'));
const PackageManagement = lazy(() => import('./pages/Organizations/PackageManagement'));
const ProductManagement = lazy(() => import('./pages/Organizations/ProductManagement'));
const UserFormManagement = lazy(() => import('./pages/Organizations/UserFormManagement'));
const EditUser = lazy(() => import('./pages/Organizations/EditUser'));
const UserView = lazy(() => import('./pages/Organizations/UserView'));
const RoleManagement = lazy(() => import('./pages/Organizations/RoleManagement'));
const UserOrgRoles = lazy(() => import('./pages/Organizations/UserOrgRoles'));

const AppContent: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define auth pages where sidebar/header should not show
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
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        {showSidebar && <Header />}
        <ToastContainer 
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
        <EnvBanner />
      </Suspense>

      {/* Main content area */}
      <main className={`flex-1 transition-all duration-300 ${
        showSidebar && sidebarOpen ? 'md:ml-64' : ''
      }`}>
        <div className={`${showSidebar ? 'pt-16 md:pt-20' : ''}`}>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div></div>}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/change-password" element={<ChangePassword />} />
            
            
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            
            <Route path="*" element={<PageNotFound />} />

            {/* Customer Management Routes */}
            <Route
              path="/manage-customers"
              element={
                <PrivateRoute>
                  <ManageCustomers />
                </PrivateRoute>
              }
            />

            <Route
              path="/list-of-consumers"
              element={
                <PrivateRoute>
                  <ListOfConsumers />
                </PrivateRoute>
              }
            />

          

            {/* Dashboard Routes */}
            <Route
              path="/org-admin-dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_ORG_ADMIN']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/bdo-dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_BDO']}>
                  <BDODashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/grampanchayat-dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_GRAMSEVAK']}>
                  <GramPanchayatDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/super-admin-dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <SuperAdminDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/representative-dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_ORG_REPRESENTATIVE','ROLE_AGENCY_REPRESENTATIVE']}>
                  <RepresentativeDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/agency-admin-dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_AGENCY_ADMIN']}>
                  <AgencyAdminDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/staff-dashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_ORG_STAFF','ROLE_AGENCY_STAFF']}>
                  <StaffDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Document Routes */}
            <Route
              path="/generate-documents"
              element={
                <PrivateRoute>
                  <GenerateDocuments />
                </PrivateRoute>
              }
            />


            {/* Customer Routes */}
            <Route
              path="/view-customer"
              element={
                <PrivateRoute>
                  <ViewCustomer />
                </PrivateRoute>
              }
            />

            <Route
              path="/edit-customer"
              element={
                <PrivateRoute>
                  <EditCustomer />
                </PrivateRoute>
              }
            />

            <Route
              path="/customer-form"
              element={
                <PrivateRoute>
                  <CustomerForm />
                </PrivateRoute>
              }
            />

            {/* Connection Routes */}
            <Route
              path="/edit-connection"
              element={
                <PrivateRoute>
                  <EditConnection />
                </PrivateRoute>
              }
            />

            <Route
              path="/view-connection"
              element={
                <PrivateRoute>
                  <ViewConnection />
                </PrivateRoute>
              }
            />

            <Route
              path="/connection-form"
              element={
                <PrivateRoute>
                  <ConnectionForm />
                </PrivateRoute>
              }
            />

            {/* Installation Routes */}
            <Route
              path="/edit-installation"
              element={
                <PrivateRoute>
                  <EditInstallation />
                </PrivateRoute>
              }
            />

            <Route
              path="/view-installation"
              element={
                <PrivateRoute>
                  <ViewInstallation />
                </PrivateRoute>
              }
            />

            <Route
              path="/installation-form"
              element={
                <PrivateRoute>
                  <InstallationForm />
                </PrivateRoute>
              }
            />

            {/* System Routes */}
            <Route
              path="/system-specifications"
              element={
                <PrivateRoute>
                  <SystemSpecifications />
                </PrivateRoute>
              }
            />

            <Route
              path="/onboarded-consumers"
              element={
                <PrivateRoute>
                  <OnboardedConsumers />
                </PrivateRoute>
              }
            />

            {/* Material Routes */}
            <Route
              path="/material-form"
              element={
                <PrivateRoute>
                  <MaterialDetails />
                </PrivateRoute>
              }
            />

            {/* Organization Routes */}
            <Route
              path="/organizations"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <OrganizationList />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/organization-form"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <OrganizationForm />
                </RoleProtectedRoute>
              }
            />

            <Route
            path="/edit-organization"
            element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN','ROLE_ORG_ADMIN']}>
                  <EditOrganization />
                </RoleProtectedRoute>
              }
            />

            <Route
            path="/edit-agency"
            element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN','ROLE_ORG_ADMIN','ROLE_AGENCY_ADMIN']}>
                  <EditAgency />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/admin-management"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN','ROLE_ORG_ADMIN']}>
                  <AdminManagement />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/agencies"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN']}>
                  <AgencyList />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/agency-form"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN']}>
                  <AgencyForm />
                </RoleProtectedRoute>
              }
            />


            <Route
              path="/organization-view"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <OrganizationView />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/agency-view"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <AgencyView />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/edit-agency"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <EditAgency />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/user-management"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <UserManagement />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/package-management"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <PackageManagement />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/product-management"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <ProductManagement />
                </RoleProtectedRoute>
              }
            />

             <Route
              path="/package-management"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <PackageManagement />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/user-form"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <UserFormManagement />
                </RoleProtectedRoute>
              }
            />


            <Route
              path="/edit-user"
              element={
                <PrivateRoute>
                  <EditUser />
                </PrivateRoute>
              }
            />

            <Route
              path="/user-view"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <UserView />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/role-management/:id"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN']}>
                  <RoleManagement />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/user-org-roles"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN','ROLE_AGENCY_ADMIN']}>
                  <UserOrgRoles />
                </RoleProtectedRoute>
              }
            />
          </Routes>
          </Suspense>
        </div>
      </main>
      
      
      {showSidebar && <Footer />}
    </div>
  );
};

function App({ basePath }: { basePath: string }) {
  return (
    
    <UserProvider>
      <Router basename={basePath}>
        <ScrollToTop />
        <AppContent />
      </Router>
    </UserProvider>
  );
}


export default App;
