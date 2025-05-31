import { useState } from "react";
import PieChart from "../ManagerPage/PieChart";
import UserManagement from "./UserManagement";
import ApprovedLawyersToggle from "./ApprovedLawyersToggle";
import SideBar from "./SideBar";

export default function Tabesex() {
  const [activeTab, setActiveTab] = useState("Tab1");

  const tabs = [
    { id: "Tab1", label: "Tab 1" },
    { id: "Tab2", label: "Tab 2" },
    { id: "Tab3", label: "Tab 3" },
    { id: "Tab4", label: "Tab 4" },
  ];

  return (
    <div className="grid md:grid-cols-4">
      <SideBar />
      <div className="flex mt-6 flex-col col-span-3 p-6">
        
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
            <PieChart/>
          </div>
        )}
        {activeTab === "Tab2" && (
          <div className="p-4 border rounded bg-gray-100">
            <UserManagement/>
          </div>
        )}
        {activeTab === "Tab3" && (
          <div className="p-4 border rounded bg-gray-100">
            <ApprovedLawyersToggle/>
          </div>
        )}
        {activeTab === "Tab4" && (
          <div className="p-4 border rounded bg-gray-100">Content for Tab 4</div>
        )}
      </div>
      </div></div>
  );
}
