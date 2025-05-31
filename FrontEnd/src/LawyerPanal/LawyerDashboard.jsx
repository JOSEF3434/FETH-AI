import { useEffect } from 'react';
import LawyerMainPage from './LawyerMainPage';
import LawyerSideBar from './LawyerSideBar';
import { useNavigate } from 'react-router-dom';

const LawyerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and user type
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!userData || userData.userType !== 'Lawyer') {
      // Clear localStorage if user is not authorized
      localStorage.clear();
      // Redirect to login page
      navigate('/login');
    }
  }, [navigate]);

  // Get user data again for rendering (after the check)
  const userData = JSON.parse(localStorage.getItem('user'));

  // If no user data (after possible clearance), don't render the dashboard
  if (!userData) {
    return null;
  }

  return (
    <div className="flex">
      <LawyerSideBar userData={userData} />
      <LawyerMainPage userData={userData} />
    </div>
  );
};

export default LawyerDashboard;