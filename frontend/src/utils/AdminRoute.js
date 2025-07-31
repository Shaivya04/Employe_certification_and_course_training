import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return <h2 style={{ color: 'crimson' }}>🚫 Access Denied. Admins only.</h2>;
  }

  return children;
};

export default AdminRoute;
