import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function LawyerSideBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State for toggle menu

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

  const handleLogout = () =>  {
    
    // Clear token and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.info("Logged out successfully!", { position: "top-right" });

    // Redirect to Hompage page
    navigate("/");
  };

  return (
    <div>
      {/* Toggle Button for Small Screens */}
      <div className="md:hidden p-4 bg-gray-800 text-white">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${ isOpen ? "block" : "hidden"
        } md:block w-64 bg-gray-800 h-screen text-white flex flex-col`} >

        <div className="p-4 text-center bg-gray-700">
          <h2 className="text-3xl py-2">Lawyer Panel</h2>
        </div>
        <ul className="mt-5 font-semibold">
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/LawyerDashboard" className="text-xl hover:text-2xl">
              Dashboard
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/UpdateLawyerProfile" className="text-xl hover:text-2xl">
            Profile Management
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/chate" className="text-xl hover:text-2xl">
            Chate
            </Link>
          </li> 
          <li className="block p-4 hover:bg-gray-600">
            <Link to="/LegalDocumentUpload" className="text-xl hover:text-2xl">
            Legal Documents
            </Link>
          </li><li className="block p-4 hover:bg-gray-600">
            <Link to="/LawyerSignup" className="text-xl hover:text-2xl">
            Payment & Earnings
            </Link>
          </li><li className="block p-4 hover:bg-gray-600">
            <Link to="/" className="text-xl hover:text-2xl">
            Reviews & Ratings
            </Link>
          </li><li className="block p-4 bg-gray-800 hover:bg-gray-600">
            <Link to="/LawyerPortal" className="text-xl hover:text-2xl">
            Support & FAQs
            </Link>
          </li>
          <li className="block p-4 bg-gray-800 hover:bg-gray-600">
            <Link to="/" className="text-xl" onClick={handleLogout}>
              Logout
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
}

export default LawyerSideBar;
