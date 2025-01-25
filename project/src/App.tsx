import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import { QuotationForm } from './components/QuotationForm';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

const AppContent: React.FC = () => {
  const location = useLocation();

  // Show Navbar only on specific routes
  const showNavbar = location.pathname !== '/login';
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditionally Render Navbar */}
      {showNavbar && <Navbar />}

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
