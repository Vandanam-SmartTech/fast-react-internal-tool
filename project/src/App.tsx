import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import  Login  from './components/Login';
import { QuotationForm } from './components/QuotationForm';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 py-12">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
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
    </Router>
  );
}

export default App;