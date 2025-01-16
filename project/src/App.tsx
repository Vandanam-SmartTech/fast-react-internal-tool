import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import { QuotationForm } from './components/QuotationForm';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar will be shown conditionally */}
        <Routes>
          <Route
            path="/quotationform"
            element={
              !['/login'].includes(window.location.pathname) && <Navbar />
            }
          />
        </Routes>

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
    </Router>
  );
}

export default App;
