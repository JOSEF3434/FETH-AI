import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ViewAppointments from './ViewAppointments';
import LawyerAppointmentToggle from "./LawyerAppointmentToggle";
import AppointmentHistory from './AppointmentHistory';

const LawyerMainPage = () => { 
  const [activeTab, setActiveTab] = useState("Tab1");

  const tabs = [
    { id: "Tab1", label: "Tod Appo" },
    { id: "Tab2",  label: "Panding Appoi" },
    { id: "Tab3", label: "Past Appoi" },
  ];

    const [user, setUser] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        navigate("/login"); // Redirect to login if user data is missing
      } else {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error.message);
          localStorage.removeItem("user"); // Clear invalid data
          navigate("/login");
        }
      }
    }, []);
  
    if (!user) {
      return <div>Loading...</div>;
    }
  
  return (
    <main className="flex-grow p-6 bg-gray-100">
     <header className="bg-cyan-500 text-white rounded ">
          <div className="flex justify-between items-center relative p-3">
            <h1 className="text-4xl md:pl-36 text-center">Hello {user.name}, Welcome</h1>
            <button
              className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none"
            >
              <Link
                to="./userdashboard"
              >
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="h-20 w-20  rounded-full hover:rounded-2xl"
                  onError={(e) => (e.target.src = "/uploads/default_avatar.png")}
                />
              </Link>
            </button>
          </div>
        </header>
        <div className="grid grid-cols-3 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 text-center border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-500 font-bold"
                : "border-gray-300 text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="mt-4">
        {activeTab === "Tab1" && (
          <div className="p-4 border rounded bg-gray-100">
           <ViewAppointments/>
          </div> 
        )}
        {activeTab === "Tab2" && (
          <div className="p-4 border rounded bg-gray-100">
            <LawyerAppointmentToggle/>
          </div>
        )}
        {activeTab === "Tab3" && (
          <div className="p-4 border rounded bg-gray-100">
            <AppointmentHistory/>
            </div>
        )}
        
      </div>
    </main>
  );
};

export default LawyerMainPage;
