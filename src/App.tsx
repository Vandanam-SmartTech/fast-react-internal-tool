import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import { UserProvider } from './contexts/UserContext';

import Login from './pages/Auth/Login';
import PrivateRoute from './routes/PrivateRoute';
import RoleProtectedRoute from './routes/RoleProtectedRoute';
import HomeRedirect from './pages/HomeRedirect';
import Sidebar from './components/Sidebar';
import ListOfConsumers from './pages/ConsumerList/ListOfConsumers';
import GenerateDocuments from './pages/Documents/GenerateDocuments';
import { CustomerForm } from './pages/Customers/CustomerForm';
import { ViewCustomer } from './pages/Customers/ViewCustomer';
import ManageCustomers from './pages/Customers/ManageCustomers';
import { ConnectionForm } from './pages/Connections/ConnectionForm';
import { ViewConnection } from './pages/Connections/ViewConnection';
import { InstallationForm } from './pages/Installations/InstallationForm';
import { ViewInstallation } from './pages/Installations/ViewInstallation';
import { SystemSpecifications } from './pages/SystemSpecifications/SystemSpecifications';
import  OnboardedConsumers  from './pages/ConsumerList/OnboardedConsumers';
import  PasswordReset  from './pages/Auth/PasswordReset'; 
import ChangePassword from './pages/Auth/ChangePassword';
import  Verification  from './pages/Auth/Verification';
import  RepresentativeDashboard  from './pages/Dashboard/RepresentativeDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import SuperAdminDashboard from './pages/Dashboard/SuperAdminDashboard';
import AgencyAdminDashboard from './pages/Dashboard/AgencyAdminDashboard';
import StaffDashboard from './pages/Dashboard/StaffDashboard';
import { EditCustomer } from './pages/Customers/EditCustomer';
import { EditConnection } from './pages/Connections/EditConnection';
import { EditInstallation } from './pages/Installations/EditInstallation';
import MaterialDetails from './pages/Materials/MaterialDetails';
import OrganizationList from './pages/Organizations/OrganizationList';
import OrganizationForm from './pages/Organizations/OrganizationForm';
import AdminManagement from './pages/Organizations/AdminManagement';
import AgencyList from './pages/Agencies/AgencyList';
import AgencyForm from './pages/Agencies/AgencyForm';
import AgencyView from './pages/Agencies/AgencyView';
import EditAgency from './pages/Agencies/EditAgency';
import OrganizationView from './pages/Organizations/OrganizationView';
import EditOrganization from './pages/Organizations/EditOrganization';
import UserManagement from './pages/Organizations/UserManagement';
import UserFormManagement from './pages/Organizations/UserFormManagement';
import UserView from './pages/Organizations/UserView';
import RoleManagement from './pages/Organizations/RoleManagement';
import UserOrgRoles from './pages/Organizations/UserOrgRoles';
import Profile from './pages/Profile/Profile';
import { ToastContainer } from 'react-toastify';
import PageNotFound from './pages/PageNotFound';
import EnvBanner from './components/EnvBanner';
import Header from './components/Header';
import Footer from './components/Footer';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define auth pages where sidebar/header should not show
  const authPages = ['/login', '/password-reset', '/verification', '/change-password', '/page-not-found'];
  const showSidebar = !authPages.includes(location.pathname);

  

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
      <Sidebar />
      
      {/* Header - Always render but control visibility */}
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

      {/* Main content area */}
      <main className={`flex-1 transition-all duration-300 ${
        showSidebar && sidebarOpen ? 'md:ml-64' : ''
      }`}>
        <div className={`${showSidebar ? 'pt-16 md:pt-20' : ''}`}>
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
    



            {/* Consumer Routes */}
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
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
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
              path="/user-form"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <UserFormManagement />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/user-form/:id"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <UserFormManagement />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/user-view/:id"
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
              path="/user-org-roles/:id"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN']}>
                  <UserOrgRoles />
                </RoleProtectedRoute>
              }
            />
          </Routes>
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
        <AppContent />
      </Router>
    </UserProvider>
  );
}


export default App;
