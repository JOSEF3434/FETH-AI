import { useState } from "react";
import LawyerSignupPage from "../LawyerPanal/LawyerSignupPage";
import UserSignup from "./UserSignup";
import Nave from "./Nave";

export default function FourColumnTabs() {
  const [activeTab, setActiveTab] = useState("Tab1");

  const tabs = [
    { id: "Tab1", label: "SignUp" },
    { id: "Tab2", label: "SignUp As Lawyer" },
  ];

  return (
    <>
      <Nave/>
    <div className="p-4">
      {/* Tabs Header */}
      <div className="grid grid-cols-2 gap-4 ml-58 mr-40">
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
            <UserSignup/>
          </div>
        )}
        {activeTab === "Tab2" && (
          <div className="p-4 border rounded bg-gray-100">
            
            <LawyerSignupPage/>
          </div>
        )}
      </div>
    </div></>
  );
}
