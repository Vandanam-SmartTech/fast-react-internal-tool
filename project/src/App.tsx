import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import  Login  from './components/Login';
import { QuotationForm } from './components/QuotationForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 py-12">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/quotation-form" element={<QuotationForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;