import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('jwtToken'); // Check token in localStorage

  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
