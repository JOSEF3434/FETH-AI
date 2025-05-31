import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and authorization
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !userData) {
          throw new Error("No authentication data found");
        }

        if (userData.userType !== "Admin") {
          throw new Error("Unauthorized access");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Authorization error:", error);
        localStorage.clear();
        toast.warning("You need to login as Admin to access this page");
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Logged out successfully!", { position: "top-right" });
    navigate("/");
  };

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  return (
    <div className="overflow-scroll">
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
      <aside
        className={`${
          isOpen ? "block" : "hidden"
        } md:block w-64 bg-gray-800 h-screen text-white flex flex-col`}
      >
        <div className="p-4 text-center bg-gray-700">
          <h2 className="text-4xl">Admin Panel</h2>
        </div>
        <ul className="mt-1">
          <li className="block p-4 hover:bg-gray-600">
            <Link
              to="/Dashboard"
              className={`text-xl hover:text-2xl ${
                location.pathname === "/Dashboard"
                  ? "block p-4 bg-gray-600 text-white text-xl"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600">
            <Link
              to="/UpdateProfile"
              className={`text-xl hover:text-2xl ${
                location.pathname === "/UpdateProfile"
                  ? "block p-4 bg-gray-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Profile Management
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600">
            <Link
              to="/chate"
              className={`text-xl hover:text-2xl ${
                location.pathname === "/chate"
                  ? "block p-4 bg-gray-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Chate
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600">
            <Link
              to="/ApprovedLawyersToggle"
              className={`text-xl hover:text-2xl ${
                location.pathname === "/ApprovedLawyersToggle"
                  ? "block p-4 bg-gray-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Lawyer Management
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600">
            <Link
              to="/UserManagement"
              className={`text-xl hover:text-2xl ${
                location.pathname === "/UserManagement"
                  ? "block p-4 bg-gray-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              User Management
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600">
            <Link
              to="/AdminMessageList"
              className={`text-xl hover:text-2xl ${
                location.pathname === "/AdminMessageList"
                  ? "block p-4 bg-gray-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              UserMess
            </Link>
          </li>
          <li className="block p-4 hover:bg-gray-600">
            <Link
              to="/AddUser"
              className={`text-xl hover:text-2xl ${
                location.pathname === "/AddUser"
                  ? "block p-4 bg-gray-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Add User
            </Link>
          </li>
          <li className="block bg-gray-800 p-4 hover:bg-gray-600">
            <Link
              to="/A_ChangePassword"
              className={`text-xl hover:text-2xl ${
                location.pathname === "/A_ChangePassword"
                  ? "block p-4 bg-gray-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              ChangePass
            </Link>
          </li>
          <li className="block bg-gray-800 p-4 hover:bg-gray-600">
            <Link
              to="/"
              className="text-xl hover:text-3xl"
              onClick={handleLogout}
            >
              Logout
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
}

export default SideBar;