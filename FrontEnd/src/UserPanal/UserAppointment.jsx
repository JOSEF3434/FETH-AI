import { useState } from "react";
import UserSideBar from './UserSideBar';
import Nave from '../Pages/Nave';
import BookAppointment from "../Pages/BookAppointment";
import MyAppointments from "../Pages/MyAppointments";
import PastAppointment from "../components/PastAppointment";
import TodayAppointment from "../components/TodayAppointment";

export default function UserAppointment() {
  const [activeTab, setActiveTab] = useState("Tab1");

  const tabs = [
    { id: "Tab1", label: "Tod Appo" },
    { id: "Tab2", label: "Book Appointment" },
    { id: "Tab3", label: "Panding Appoi" },
    { id: "Tab4", label: "All Appointment" },
  ];

  return (
    <><Nave/>
    <div className="grid md:grid-cols-4">
    <UserSideBar />
    <div className="p-4 col-span-3">
      {/* Tabs Header */}
      <div className="grid grid-cols-4 gap-4">
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
           <TodayAppointment/>
          </div> 
        )}
        {activeTab === "Tab2" && (
          <div className="p-4 border rounded bg-gray-100">
            <BookAppointment/>
          </div>
        )}
        {activeTab === "Tab3" && (
          <div className="p-4 border rounded bg-gray-100">
            <MyAppointments/>
            </div>
        )}
        {activeTab === "Tab4" && (
          <div className="p-4 border rounded bg-gray-100">
            <PastAppointment/>
          </div>
        )}
      </div>
    </div></div></>
  );
}
