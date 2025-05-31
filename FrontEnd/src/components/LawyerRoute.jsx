
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LawyerRoute = () => {
  const { currentUser } = useAuth();
  
  return currentUser?.userType === 'Lawyer' ? <Outlet /> : <Navigate to="/" />;
};

export default LawyerRoute;