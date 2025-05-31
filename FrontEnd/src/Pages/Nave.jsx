import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Nave = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); 
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    console.log(token,storedUser);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error.message);
        localStorage.removeItem("user"); // Clear invalid data
        navigate("/");
      }
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-24 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center md:p-15 sm:px-15">
            <Link to="../Assites/feth_AI_logo.png" rel="noopener noreferrer">
              <img
                className="h-21 sm:h-24 w-auto rounded-full"
                src="../Assites/feth_AI_logo.png"
                alt="FETH AI LOGO`S"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md flex text-xl font-medium ${
                location.pathname === '/'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mx-2 mt-1">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                /> 
              </svg>
              Home
            </Link>
            <Link 
              to="/About"
              className={`px-3 py-2 rounded-md text-xl font-medium ${
                location.pathname === '/About'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            > 
              About 
            </Link>
            <Link 
              to="/Contact"
              className={`px-3 py-2 rounded-md text-xl font-medium ${
                location.pathname === '/Contact'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >  
              ContactUs
            </Link>
            
            {user ? (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-xl font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Logout
              </button>
            ) : (
              <>
                <Link 
                  to="/Login"
                  className={`px-3 py-2 rounded-md text-xl font-medium ${
                    location.pathname === '/Login'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                > 
                  Login 
                </Link>
                <Link 
                  to="/Signup"
                  className={`px-3 py-2 rounded-md text-xl font-medium ${
                    location.pathname === '/Signup'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                > 
                  Signup  
                </Link>
              </>
            )}
          </div>

          {/* Icons and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="sm:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
            
            <Link 
              to="/HelpAndLegalGuide"
              className={`px-3 py-2 rounded-md text-xl font-medium ${
                location.pathname === '/HelpAndLegalGuide'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            > 
              Get Helpe 
            </Link>
            <Link 
              to="/FethAiSupporte"
              className={`px-3 py-2 rounded-md text-xl font-medium ${
                location.pathname === '/FethAiSupporte'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            > 
              Get Feth-Ai  
            </Link>

            {user && (
              <div className="relative">
                <Link
                  to="/UserDashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >                 
                  <img 
                    src={user.profilePicture || "/uploads/default_avatar.png"} 
                    alt="Profile" 
                    className='h-14 w-14 rounded-full' 
                    onError={(e) => e.target.src = "/uploads/default_avatar.png"} 
                  />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3 ">
            <Link
              to="/"
              className={`flex rounded-md px-3 py-2 text-base font-medium ${
                location.pathname === '/'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mx-2 mt-1">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                /> 
              </svg>
              Home
            </Link>
            
            <Link
              to="/About"
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                location.pathname === '/About'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              About
            </Link>
            <Link
              to="/Contact"
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                location.pathname === '/Contact'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              ContactUs
            </Link>
            
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/Login"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    location.pathname === '/Login'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/Signup"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    location.pathname === '/Signup'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nave;