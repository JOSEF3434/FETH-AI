import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";

function ManagerSideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [newLawyerCount, setNewLawyerCount] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!token || !userData || userData.userType !== 'Manager') {
          localStorage.clear();
          toast.warning("Unauthorized access. Please login as Manager.");
          navigate('/login');
          return false;
        }
        return true;
      } catch (error) {
        console.error("Authentication check error:", error);
        localStorage.clear();
        navigate('/login');
        return false;
      }
    };

    const authValid = checkAuth();
    setIsAuthorized(authValid);
  }, [navigate]);

  // Fetch data only if authorized
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchUnseenCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('http://localhost:4000/api/contact/messages/unseen/count', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.clear();
          navigate('/login');
          return;
        }
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const { count } = await response.json();
        setUnseenCount(count);
      } catch (error) {
        console.error("Error fetching unseen messages:", error);
      }
    };

    const fetchNewLawyerCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('http://localhost:4000/api/lawyers/count-new', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const { count } = await response.json();
        setNewLawyerCount(count);
      } catch (error) {
        console.error("Error fetching new lawyer count:", error);
      }
    };

    fetchUnseenCount();
    fetchNewLawyerCount();

    const messageInterval = setInterval(fetchUnseenCount, 10000);
    const lawyerInterval = setInterval(fetchNewLawyerCount, 15000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(lawyerInterval);
    };
  }, [isAuthorized, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Logged out successfully!", { position: "top-right" });
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const menuItems = [
    { 
      path: "/ManagerDashboard", 
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Dashboard</span>
          {newLawyerCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {newLawyerCount}
            </span>
          )}
        </div>
      ) 
    },
    { path: "/Chate", label: "Chat" },
    { path: "/AppointmentManagement", label: "Appointment" },
    { 
      path: "/Feedback", 
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Feedback and Support</span>
          {unseenCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unseenCount}
            </span>
          )}
        </div>
      ) 
    },
    { path: "/PaymentHistoryManagement", label: "Payment History" },
    { path: "/ManageDocuments", label: "Legal Document" },
    { path: "/UpdateProfile", label: "Update Profile" },
  ];

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="overflow-scroll">
      {/* Mobile Menu Button */}
      <div className="md:hidden flex justify-between items-center p-4 bg-gray-800">
        <button onClick={toggleMenu} className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          bg-gray-800 text-white fixed md:static z-50
          ${menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          transition-transform duration-300 ease-in-out
          top-0 left-0 w-64 h-full
        `}
      >
        <div className="p-4 text-center bg-gray-700">
          <h2 className="text-2xl">Manager Panel</h2>
        </div>
        
        <ul className="mt-4">
          {menuItems.map((item) => (
            <li key={item.path} className="block bg-gray-800 hover:bg-gray-600">
              <Link
                to={item.path}
                className={`
                  block p-4 text-xl
                  ${location.pathname === item.path
                    ? "bg-gray-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"}
                `}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          
          <li className="block hover:bg-gray-600">
            <button
              onClick={handleLogout}
              className="w-full text-left p-4 text-xl text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white"
            >
              Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}
    </div>
  );
}

export default ManagerSideBar;