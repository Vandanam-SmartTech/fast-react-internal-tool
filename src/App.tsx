import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import ListOfConsumers from './components/ListOfConsumers';
import GenerateDocuments from './components/GenerateDocuments';
import { CustomerForm } from './components/CustomerForm';
import { ViewCustomer } from './components/ViewCustomer';
import { ConnectionForm } from './components/ConnectionForm';
import { ViewConnection } from './components/ViewConnection';
import { InstallationForm } from './components/InstallationForm';
import { ViewInstallation } from './components/ViewInstallation';
import { SystemSpecifications } from './components/SystemSpecifications';
import  OnboardedCustomers  from './components/OnboardedCustomers';
import  PasswordReset  from './components/PasswordReset'; 
import ChangePassword from './components/ChangePassword';
import  Verification  from './components/Verification';
import  RepresentativeDashboard  from './components/RepresentativeDashboard';
import AdminDashboard from './components/AdminDashboard';
import { EditCustomer } from './components/EditCustomer';
import { EditConnection } from './components/EditConnection';
import { EditInstallation } from './components/EditInstallation';
import MaterialDetails from './components/MaterialDetails';
import { ToastContainer } from 'react-toastify';

const AppContent: React.FC = () => {
  const location = useLocation();

 const showSidebar = location.pathname !== '/login' && location.pathname !== '/PasswordReset' && location.pathname !== '/Verification' && location.pathname !== '/ChangePassword';

  return (
    <div className="min-h-screen bg-gray-50">
      {showSidebar && <Sidebar />}

      <ToastContainer position="top-right" autoClose={1000} />

      <div className="py-12">
        <Routes>

          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<Login />} />

          <Route path="/PasswordReset" element={<PasswordReset />} />

          <Route path="/Verification" element={<Verification />} />

          <Route path="/ChangePassword" element={<ChangePassword />} />
          
          <Route
            path="/list-of-consumers"
            element={
              <PrivateRoute>
                <ListOfConsumers />
              </PrivateRoute>
            }
          />

          <Route
            path="/RepresentativeDashboard"
            element={
              <PrivateRoute>
                <RepresentativeDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/AdminDashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

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
              path="/edit-connection/:id"
              element={
              <PrivateRoute>
                <EditConnection />
              </PrivateRoute>
            }
          />

          <Route
              path="/edit-installation/:id"
              element={
              <PrivateRoute>
                <EditInstallation />
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
              path="/view-installation/:id"
              element={
              <PrivateRoute>
                <ViewInstallation />
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
          <Route
              path="/ConnectionForm"
              element={
              <PrivateRoute>
                <ConnectionForm />
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

          <Route
              path="/SystemSpecifications"
              element={
              <PrivateRoute>
                <SystemSpecifications />
              </PrivateRoute>
            }
          />

          <Route
              path="/OnboardedCustomers"
              element={
              <PrivateRoute>
                <OnboardedCustomers />
              </PrivateRoute>
            }
          />

            <Route
              path="/material-form/:id"
              element={
              <PrivateRoute>
                <MaterialDetails/>
              </PrivateRoute>
            }
          />

        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
