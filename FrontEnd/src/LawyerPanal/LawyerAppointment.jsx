import { useState } from "react";
import LawyerSideBar from "./LawyerSideBar";
//import BookAppointment from "../Pages/BookAppointment";
import LawyerAppointmentToggle from "./LawyerAppointmentToggle";
import AppointmentHistory from "./AppointmentHistory";
import ViewAppointments from "./ViewAppointments";
import LawyerBookAppointment from "./LawyerBookAppointment";

export default function LawyerAppointment() {
  const [activeTab, setActiveTab] = useState("Tab1");

  const tabs = [
    { id: "Tab1", label: "Tod Appo" },
    { id: "Tab2", label: "Book Appointment" },
    { id: "Tab3", label: "Panding Appoi" },
    { id: "Tab4", label: "Past Appoi" },
  ];

  return (
    <>
    <div className="grid md:grid-cols-4">
    <LawyerSideBar />
    <div className="p-4 col-span-3 mt-9">
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
           <ViewAppointments/>
          </div> 
        )}
        {activeTab === "Tab2" && (
          <div className="p-4 border rounded bg-gray-100">
            <LawyerBookAppointment/>
          </div>
        )}
        {activeTab === "Tab3" && (
          <div className="p-4 border rounded bg-gray-100">
            <LawyerAppointmentToggle/>
            </div>
        )}
        {activeTab === "Tab4" && (
          <div className="p-4 border rounded bg-gray-100">
            <AppointmentHistory/>
          </div>
        )}
      </div>
    </div></div></>
  );
}
