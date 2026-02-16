import { lazy } from 'react';

// Auth
export const Login = lazy(() => import('../pages/Auth/Login'));
export const PasswordReset = lazy(() => import('../pages/Auth/PasswordReset'));
export const Verification = lazy(() => import('../pages/Auth/Verification'));
export const ChangePassword = lazy(() => import('../pages/Auth/ChangePassword'));

// Dashboards
export const AdminDashboard = lazy(() => import('../pages/Dashboard/AdminDashboard'));
export const BDODashboard = lazy(() => import('../pages/Dashboard/BDODashboard'));
export const GramPanchayatDashboard = lazy(() => import('../pages/Dashboard/GramPanchayatDashboard'));
export const SuperAdminDashboard = lazy(() => import('../pages/Dashboard/SuperAdminDashboard'));
export const RepresentativeDashboard = lazy(() => import('../pages/Dashboard/RepresentativeDashboard'));
export const AgencyAdminDashboard = lazy(() => import('../pages/Dashboard/AgencyAdminDashboard'));
export const StaffDashboard = lazy(() => import('../pages/Dashboard/StaffDashboard'));

// Customers
export const ManageCustomers = lazy(() => import('../pages/Customers/ManageCustomers'));
export const ViewCustomer = lazy(() => import('../pages/Customers/ViewCustomer').then(m => ({ default: m.ViewCustomer })));
export const EditCustomer = lazy(() => import('../pages/Customers/EditCustomer').then(m => ({ default: m.EditCustomer })));
export const CustomerForm = lazy(() => import('../pages/Customers/CustomerForm').then(m => ({ default: m.CustomerForm })));

// Organizations
export const OrganizationList = lazy(() => import('../pages/Organizations/OrganizationList'));
export const OrganizationForm = lazy(() => import('../pages/Organizations/OrganizationForm'));
export const EditOrganization = lazy(() => import('../pages/Organizations/EditOrganization'));
export const OrganizationView = lazy(() => import('../pages/Organizations/OrganizationView'));
export const AdminManagement = lazy(() => import('../pages/Organizations/AdminManagement'));
export const UserManagement = lazy(() => import('../pages/Organizations/UserManagement'));
export const PackageManagement = lazy(() => import('../pages/Organizations/PackageManagement'));
export const ProductManagement = lazy(() => import('../pages/Organizations/ProductManagement'));
export const UserFormManagement = lazy(() => import('../pages/Organizations/UserFormManagement'));
export const EditUser = lazy(() => import('../pages/Organizations/EditUser'));
export const UserView = lazy(() => import('../pages/Organizations/UserView'));
export const RoleManagement = lazy(() => import('../pages/Organizations/RoleManagement'));
export const UserOrgRoles = lazy(() => import('../pages/Organizations/UserOrgRoles'));

// Agencies
export const AgencyList = lazy(() => import('../pages/Agencies/AgencyList'));
export const AgencyForm = lazy(() => import('../pages/Agencies/AgencyForm'));
export const AgencyView = lazy(() => import('../pages/Agencies/AgencyView'));
export const EditAgency = lazy(() => import('../pages/Agencies/EditAgency'));

// Connections
export const EditConnection = lazy(() => import('../pages/Connections/EditConnection').then(m => ({ default: m.EditConnection })));
export const ViewConnection = lazy(() => import('../pages/Connections/ViewConnection').then(m => ({ default: m.ViewConnection })));
export const ConnectionForm = lazy(() => import('../pages/Connections/ConnectionForm').then(m => ({ default: m.ConnectionForm })));

// Installations
export const EditInstallation = lazy(() => import('../pages/Installations/EditInstallation').then(m => ({ default: m.EditInstallation })));
export const ViewInstallation = lazy(() => import('../pages/Installations/ViewInstallation').then(m => ({ default: m.ViewInstallation })));
export const InstallationForm = lazy(() => import('../pages/Installations/InstallationForm').then(m => ({ default: m.InstallationForm })));

// Others
export const Profile = lazy(() => import('../pages/Profile/Profile'));
export const ListOfConsumers = lazy(() => import('../pages/ConsumerList/ListOfConsumers').then(m => ({ default: m.ListOfConsumers })));
export const OnboardedConsumers = lazy(() => import('../pages/ConsumerList/OnboardedConsumers'));
export const GenerateDocuments = lazy(() => import('../pages/Documents/GenerateDocuments'));
export const SystemSpecifications = lazy(() => import('../pages/SystemSpecifications/SystemSpecifications').then(m => ({ default: m.SystemSpecifications })));
export const MaterialDetails = lazy(() => import('../pages/Materials/MaterialDetails'));
export const PageNotFound = lazy(() => import('../pages/PageNotFound'));

export const ViewSystemSpecifications = lazy(() =>
  import('../pages/SystemSpecifications/ViewSystemSpecifications')
    .then(m => ({ default: m.ViewSystemSpecifications }))
);

export const PaymentPlaceholder = lazy(() =>
  import('../pages/Payment/PaymentPlaceholder')
    .then(m => ({ default: m.PaymentPlaceholder }))
);

export const PreviewSystemSpecification = lazy(() =>
  import('../pages/SystemSpecifications/PreviewSystemSpecification')
    .then(m => ({ default: m.PreviewSystemSpecification }))
);

export const CheckoutSystemSpecification = lazy(() =>
  import('../pages/SystemSpecifications/CheckoutSystemSpecification')
    .then(m => ({ default: m.CheckoutSystemSpecification }))
);

// Components
export const ScrollToTop = lazy(() => import('../components/ScrollToTop'));
export const Sidebar = lazy(() => import('../components/Sidebar'));
export const Header = lazy(() => import('../components/Header'));
export const Footer = lazy(() => import('../components/Footer'));
export const EnvBanner = lazy(() => import('../components/EnvBanner'));
export const ToastContainer = lazy(() => import('react-toastify').then(m => ({ default: m.ToastContainer })));

// Routes
export const PrivateRoute = lazy(() => import('../routes/PrivateRoute'));
export const RoleProtectedRoute = lazy(() => import('../routes/RoleProtectedRoute'));

//
