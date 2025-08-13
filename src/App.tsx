import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import { ThemeProvider } from './contexts/ThemeContext';
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
import ListOfUsers from './pages/Users/ListOfUsers';
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
import  UserForm  from './pages/Users/UserForm';
import ViewUser  from './pages/Users/ViewUser';
import EditUser from './pages/Users/EditUser';
import MaterialDetails from './pages/Materials/MaterialDetails';
import OrganizationList from './pages/Organizations/OrganizationList';
import OrganizationForm from './pages/Organizations/OrganizationForm';
import AdminManagement from './pages/Organizations/AdminManagement';
import AgencyList from './pages/Organizations/AgencyList';
import AgencyForm from './pages/Organizations/AgencyForm';
import OrganizationView from './pages/Organizations/OrganizationView';
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
  const [isOpen, setIsOpen] = useState(false);

  // Define auth pages where sidebar/header should not show
  const authPages = ['/login', '/PasswordReset', '/Verification', '/ChangePassword', '/PageNotFound'];
  const showSidebar = !authPages.includes(location.pathname);

  const envLabel = import.meta.env.VITE_ENV_LABEL || 'Development';

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
      
      <EnvBanner envLabel={envLabel} />

      {/* Main content area */}
      <main className={`flex-1 transition-all duration-300 ${
        showSidebar && sidebarOpen ? 'md:ml-64' : ''
      }`}>
        <div className={`${showSidebar ? 'pt-16 md:pt-20' : ''}`}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/PasswordReset" element={<PasswordReset />} />
            <Route path="/Verification" element={<Verification />} />
            <Route path="/ChangePassword" element={<ChangePassword />} />
            
            {/* Profile Route */}
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

            <Route
              path="/list-of-users"
              element={
                <PrivateRoute>
                  <ListOfUsers />
                </PrivateRoute>
              }
            />

            {/* Dashboard Routes */}
            <Route
              path="/AdminDashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_ORG_ADMIN']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/SuperAdminDashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <SuperAdminDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/RepresentativeDashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_ORG_REPRESENTATIVE','ROLE_AGENCY_REPRESENTATIVE']}>
                  <RepresentativeDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/AgencyAdminDashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_AGENCY_ADMIN']}>
                  <AgencyAdminDashboard />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/StaffDashboard"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_ORG_STAFF','ROLE_AGENCY_STAFF']}>
                  <StaffDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Document Routes */}
            <Route
              path="/generatedocuments"
              element={
                <PrivateRoute>
                  <GenerateDocuments />
                </PrivateRoute>
              }
            />

            <Route
              path="/generatedocuments/:id"
              element={
                <PrivateRoute>
                  <GenerateDocuments />
                </PrivateRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/view-customer/:id"
              element={
                <PrivateRoute>
                  <ViewCustomer />
                </PrivateRoute>
              }
            />

            <Route
              path="/edit-customer/:id"
              element={
                <PrivateRoute>
                  <EditCustomer />
                </PrivateRoute>
              }
            />

            <Route
              path="/CustomerForm"
              element={
                <PrivateRoute>
                  <CustomerForm />
                </PrivateRoute>
              }
            />

            {/* Connection Routes */}
            <Route
              path="/edit-connection/:id"
              element={
                <PrivateRoute>
                  <EditConnection />
                </PrivateRoute>
              }
            />

            <Route
              path="/view-connection/:id"
              element={
                <PrivateRoute>
                  <ViewConnection />
                </PrivateRoute>
              }
            />

            <Route
              path="/ConnectionForm"
              element={
                <PrivateRoute>
                  <ConnectionForm />
                </PrivateRoute>
              }
            />

            {/* Installation Routes */}
            <Route
              path="/edit-installation/:id"
              element={
                <PrivateRoute>
                  <EditInstallation />
                </PrivateRoute>
              }
            />

            <Route
              path="/view-installation/:id"
              element={
                <PrivateRoute>
                  <ViewInstallation />
                </PrivateRoute>
              }
            />

            <Route
              path="/InstallationForm"
              element={
                <PrivateRoute>
                  <InstallationForm />
                </PrivateRoute>
              }
            />

            {/* System Routes */}
            <Route
              path="/SystemSpecifications"
              element={
                <PrivateRoute>
                  <SystemSpecifications />
                </PrivateRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/view-user/:id"
              element={
                <PrivateRoute>
                  <ViewUser />
                </PrivateRoute>
              }
            />

            <Route
              path="/edit-user/:id"
              element={
                <PrivateRoute>
                  <EditUser />
                </PrivateRoute>
              }
            />

            <Route
              path="/UserForm"
              element={
                <PrivateRoute>
                  <UserForm />
                </PrivateRoute>
              }
            />

            {/* Consumer Routes */}
            <Route
              path="/OnboardedConsumers"
              element={
                <PrivateRoute>
                  <OnboardedConsumers />
                </PrivateRoute>
              }
            />

            {/* Material Routes */}
            <Route
              path="/material-form/:id"
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
              path="/organization-form/:id"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
                  <OrganizationForm />
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
              path="/agencies/:orgId"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN']}>
                  <AgencyList />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/agency-form/:orgId"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN']}>
                  <AgencyForm />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/agency-form/:orgId/:agencyId"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <AgencyForm />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/organization-view/:id"
              element={
                <RoleProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ORG_ADMIN', 'ROLE_AGENCY_ADMIN']}>
                  <OrganizationView />
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
      
      {/* Footer - Only show on authenticated pages */}
      {showSidebar && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router basename="/solarpro">
          <AppContent />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
