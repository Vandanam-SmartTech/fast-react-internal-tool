import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import { QuotationForm } from './components/QuotationForm';
import PrivateRoute from './components/PrivateRoute';
//import Navbar from './components/Navbar';
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

import  RepresentativeDashboard  from './components/RepresentativeDashboard';
import AdminDashboard from './components/AdminDashboard';
import { EditCustomer } from './components/EditCustomer';
import { EditConnection } from './components/EditConnection';
import { EditInstallation } from './components/EditInstallation';

const AppContent: React.FC = () => {
  const location = useLocation();

  // Show Navbar only on specific routes
 // const showNavbar = location.pathname !== '/login';
 const showSidebar = location.pathname !== '/login';
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditionally Render Navbar */}
      {/* {showNavbar && <Navbar />} */}
      {showSidebar && <Sidebar />}

      <div className="py-12">
        <Routes>
          {/* Redirect to login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Quotation Form */}
          <Route
            path="/quotationform"
            element={
              <PrivateRoute>
                <QuotationForm />
              </PrivateRoute>
            }
          />
          
          {/* Protected List of Consumers */}
          <Route
            path="/list-of-consumers"
            element={
              <PrivateRoute>
                <ListOfConsumers />
              </PrivateRoute>
            }
          />
          <Route
              path="/quotationform/:id"
              element={
              <PrivateRoute>
                <QuotationForm />
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
              path="/material-form/:id"
              element={
              <PrivateRoute>
                <MaterialForm/>
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
