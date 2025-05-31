import { useState } from "react";
import UnseenMessages from "./UnseenMessages";
import SeenMessages from "./SeenMessages";
import ManagerSideBar from "./ManagerSideBar";
import FaqList from "../components/FaqList";
import PublicFaqPage from "../components/PublicFaqPage";

export default function Feedback() {
  const [activeTab, setActiveTab] = useState("Tab1");

  const tabs = [
    { id: "Tab1", label: "New FeedBack" },
    { id: "Tab2", label: "All FeedBack" },
    { id: "Tab3", label: "Tab 3" },
    { id: "Tab4", label: "Tab 4" },
  ];

  return (
    <div className="grid md:grid-cols-4">
      <ManagerSideBar />
    <div className="col-span-3 overflow-x-auto mt-5 p-5">
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
            <UnseenMessages/>
          </div>
        )}
        {activeTab === "Tab2" && (
          <div className="p-4 border rounded bg-gray-100">
            <SeenMessages/>
            </div>
        )}
        {activeTab === "Tab3" && (
          <div className="p-4 border rounded bg-gray-100"><PublicFaqPage/></div>
        )}
        {activeTab === "Tab4" && (
          <div className="p-4 border rounded bg-gray-100">
            <FaqList/>
          </div>
        )}
      </div>
    </div></div>
  );
}
