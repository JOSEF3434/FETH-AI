import { Link, useNavigate } from "react-router-dom"; 
import { toast } from "react-toastify";
import { useState } from "react";

function UserSideBar() { // Get setUser from context
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () =>  {
    
    // Clear token and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.info("Logged out successfully!", { position: "top-right" });

    // Redirect to Hompage page
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev); // Correctly toggle state
  };

  return (
    <div>
      {/* Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center p-4 bg-gray-800">
        <button onClick={toggleMenu} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"/>
          </svg>
        </button>
      </div>

      {/* Sidebar for Mobile View */}
      <div className={`md:hidden bg-gray-800 text-white transition-transform fixed top-0 left-0 w-64 h-full z-50 transform ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-4 text-center bg-gray-700">
          <h2 className="text-2xl">User Panel</h2>
        </div>
        <ul className="mt-4">
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/UserDashboard" className={` text-xl ${
                location.pathname === '/UserDashboard'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Dashboard</Link></li>
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/UpdateProfile" className={` text-xl ${
                location.pathname === '/UpdateProfile'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Update Profile</Link></li>
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/Chate" className={` text-xl ${
                location.pathname === '/Chate'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Chat</Link></li>
          <li className="block p-4 hover:bg-gray-600"><Link to="/UserDocumentsView" className={` text-xl ${
                location.pathname === '/UserDocumentsView'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Legal Document</Link>
                  </li>
         <li className="block p-4 hover:bg-gray-600">
            <Link to="/UserAppointment" className="text-xl hover:text-2xl">
              My Appointment
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600"><Link to="/ChangePassword" className={` text-xl ${
                location.pathname === '/ChangePassword'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Change Password</Link></li>
          <li className="block p-4 hover:bg-gray-600"><button onClick={handleLogout} className="w-full text-left">Logout</button></li>
        </ul>
      </div>

      {/* Sidebar for Desktop View */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 h-screen text-white">
        <div className="p-4 text-center bg-gray-700">
          <h2 className="text-2xl">User Panel</h2>
        </div>
        <ul className="mt-4">
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/UserDashboard" className={` text-xl ${
                location.pathname === '/UserDashboard'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Dashboard</Link></li>
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/UpdateProfile" className={` text-xl ${
                location.pathname === '/UpdateProfile'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Update Profile</Link></li>
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/Chate" className={` text-xl ${
                location.pathname === '/Chate'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Chat</Link></li>
          <li className="block p-4 hover:bg-gray-600"><Link to="/UserDocumentsView" className={` text-xl ${
                location.pathname === '/UserDocumentsView'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Legal Document</Link></li>
         
         <li className="block p-4 hover:bg-gray-600">
            <Link to="/UserAppointment" className="text-xl hover:text-2xl">
              My Appointment
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600"><Link to="/ChangePassword" className={` text-xl ${
                location.pathname === '/ChangePassword'
                  ? 'block p-4 bg-gray-600 text-white text-xl'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>Change Password</Link></li>
          <li className="block p-4 hover:bg-gray-600  text-xl ">
            <button onClick={handleLogout} className="w-full text-left">Logout</button></li>
        </ul>
      </aside>
    </div>
  );
}

export default UserSideBar;
