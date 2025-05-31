//import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { currentUser } = useAuth();
  
  return currentUser?.userType === 'Admin' ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;