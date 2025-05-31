// import React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainPage from './MainPage'
import SideBar from './SideBar'

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication and user type
    const userData = JSON.parse(localStorage.getItem('user'));
    
    if (!userData || userData.userType !== 'Admin') {
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
      <SideBar />
      <MainPage />
    </div>
  )
}

export default Dashboard
