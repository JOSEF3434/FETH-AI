import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerMainPage from './ManagerMainPage';
import ManagerSideBar from './ManagerSideBar';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Check authentication and authorization
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      // If no user data or token, redirect to login
      if (!userData || !token) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      // If token is expired, clear storage and redirect
      if (isTokenExpired(token)) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        // If user is not a Manager, redirect to unauthorized
        if (user.userType !== 'Manager') {
        localStorage.clear();
          navigate('/login');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
        navigate('/login');
      }
    };

    checkAuth();

    // Optional: Set up periodic token check (e.g., every minute)
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Get user data to verify
  const userData = localStorage.getItem('user');
  if (!userData) {
    return null; // or a loading spinner
  }

  let user;
  try {
    user = JSON.parse(userData);
  } catch (error) {
    localStorage.clear();
    navigate('/login');
    return null;
  }

  // If user is not a Manager, don't render the dashboard
  if (user.userType !== 'Manager') {
    return null;
  }

  return (
    <div className="flex h-screen">
      <ManagerSideBar />
      <ManagerMainPage />
    </div>
  );
};

export default ManagerDashboard;