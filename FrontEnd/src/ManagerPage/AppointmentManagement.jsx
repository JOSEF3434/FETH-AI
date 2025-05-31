import { useState } from "react";
import ManagerSideBar from "./ManagerSideBar";
import ManagerTodayAppointment from "./ManagerTodayAppointment";
import ManagerPastAppointments from "./ManagerPastAppointments";
import FuturAppointments from "./FuturAppointments";

const AppointmentManagement = () => {
  const [activeTab, setActiveTab] = useState("Tab1");

  const tabs = [
    { id: "Tab1", label: "Today`s Appointment" },
    { id: "Tab2", label: "Past Appointment" },
    { id: "Tab3", label: "Futur Appointmet" },
  ];

  return (
    <div className='flex h-screen'>
      {/* Fixed Sidebar */}
      <div className='h-full'>
        <ManagerSideBar />
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="bg-cyan-500 text-2xl py-7 px-20">
          APPOINTMENT MANAGEMENT
        </div>
        
        {/* Fixed Tabs */}
        <div className="grid grid-cols-4 gap-4 bg-white pt-4 px-4">
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "Tab1" && (
            <div className="p-4 border rounded bg-gray-100">
              <ManagerTodayAppointment/>
            </div>
          )}
          {activeTab === "Tab2" && (
            <div className="p-4 border rounded bg-gray-100"><ManagerPastAppointments/></div>
          )}
          {activeTab === "Tab3" && (
            <div className="p-4 border rounded bg-gray-100">
              <FuturAppointments/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentManagement;