import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import searchIcon from "../chate/image/search.png";
import ManagerSideBar from "./ManagerSideBar";

const LawyerManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Tab1");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");

  const tabs = [
    { id: "Tab1", label: "Approved Lawyer`s" },
    { id: "Tab3", label: "New Lawyer" },
    { id: "Tab4", label: "All Users" },
    { id: "Tab5", label: "Rejected Lawyer" },
  ];

  // Fetch unapproved lawyers (approved: false and states: false)
  const fetchunapprovedLawyers = () => {
    fetch("http://localhost:4000/api/lawyers/unapproved")
      .then((res) => res.json())
      .then((data) => setLawyers(data))
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch lawyers");
      });
  };

  // Fetch lawyers with approved: true and states: true
  const fetchapprovedLawyers = () => {
    fetch("http://localhost:4000/api/lawyers/active-approved")
      .then((res) => res.json())
      .then((data) => setLawyers(data))
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch active approved lawyers");
      });
  };

  // Fetch lawyers with Rejected lawyer 
  const fetchrejectLawyers = () => {
    fetch("http://localhost:4000/api/lawyers/rejected")
      .then((res) => res.json())
      .then((data) => setLawyers(data))
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch Rejected lawyers");
      });
  };

  // Fetch user data
  const fetchUsers = () => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        const response = await fetch("http://localhost:4000/api/users/users", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Check if the data is an array before using .filter() or .map()
          if (Array.isArray(data)) {
            setUsers(data);

            // Count user types
            const userCounts = {
              user: data.filter((u) => u.userType === "User").length,
              manager: data.filter((u) => u.userType === "Manager").length,
              admin: data.filter((u) => u.userType === "Admin").length,
            };
            setCounts(userCounts);
          } else {
            console.error("Received data is not an array:", data);
          }
        } else {
          console.error("Failed to fetch users:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  };

  // Approve lawyer
  const handleApprove = (id) => {
    fetch(`http://localhost:4000/api/lawyers/approve/${id}`, {
      method: "PUT",
    })
      .then((res) => res.json())
      .then(() => {
        toast.success("Lawyer approved successfully");
        setLawyers((prevLawyers) =>
          prevLawyers.filter((lawyer) => lawyer._id !== id)
        );
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to approve lawyer");
      });
  };

  // Reject lawyer (soft delete; update approved and states to false)
  const handleReject = (id) => {
    fetch(`http://localhost:4000/api/lawyers/reject/${id}`, {
      method: "PUT",
    })
      .then((res) => res.json())
      .then(() => {
        toast.success("Lawyer rejected");
        setLawyers((prevLawyers) =>
          prevLawyers.filter((lawyer) => lawyer._id !== id)
        );
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to reject lawyer");
      });
  };

  // Filter users based on search term, status filter, and user type filter
  const filteredUsers = users.filter((user) => {
    // Search by name or email
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by status (active/inactive)
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.state === "Active") ||
      (statusFilter === "inactive" && user.state === "Inactive");

    // Filter by user type
    const matchesUserType = userTypeFilter === "all" || user.userType === userTypeFilter;

    return matchesSearch && matchesStatus && matchesUserType;
  });

  // Render download link for a document if available
  const renderDocumentLink = (docField, label) => {
    if (docField) {
      // Assuming docField holds the full URL or relative path
      return (
        <a
          href={`http://localhost:4000/uploads/${docField}`} // Adjust path to match your backend static files location
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {label}
        </a>
      );
    }
    return <span className="text-gray-400">N/A</span>;
  };

  useEffect(() => {
    if (activeTab === "Tab3") {
      fetchunapprovedLawyers();
    } else if (activeTab === "Tab2") {
      fetchapprovedLawyers();
    } else if (activeTab === "Tab5") {
      fetchrejectLawyers();
    } else if (activeTab === "Tab4") {
      fetchUsers();
    }
  }, [activeTab]);

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
    <div className="grid md:grid-cols-4">
      <ManagerSideBar />
      <div className="flex flex-col col-span-3 items-center py-6 bg-gray-100 min-h-screen">
      <main className="flex-grow p-1 overflow-scroll bg-gray-100">
        <header className="bg-cyan-500 text-white rounded ">
          <div className="flex justify-between items-center relative p-6">
            <h1 className="text-4xl md:pl-36 text-center">Lawyer Managment Page</h1>
          </div>
        </header>
        <center>
          <div className="p-4">
            {/* Tabs Header */}
            <div className="grid grid-cols-5 gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-4 text-center border-b-2 transition-all ${activeTab === tab.id
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
                  <div className="container mx-auto p-4">
                    <h2 className="text-2xl font-bold mb-4"> Approved Lawyer`s</h2>
                    <table className="min-w-full bg-white border border-gray-300">
                      <thead>
                        <tr className="bg-gray-200 text-left">
                          <th className="py-2 px-4 border">Name</th>
                          <th className="py-2 px-4 border">Email</th>
                          <th className="py-2 px-4 border">Specialization</th>
                          <th className="py-2 px-4 border">Chat</th>
                          <th className="py-2 px-4 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lawyers.map((lawyer) => (
                          <tr key={lawyer._id} className="border-b">
                            <td className="py-2 px-4">
                              <img
                                src={`http://localhost:4000/uploads/${lawyer.profilePicture}`}
                                alt={`${lawyer.firstName}'s Profile`}
                                className="h-10 w-10 rounded-full hover:rounded-2xl"
                                onError={(e) =>
                                  (e.target.src = "/uploads/default_avatar.png") // Default avatar fallback
                                }
                              />
                              {lawyer.firstName} {lawyer.lastName}
                            </td>
                            <td className="py-2 px-4">{lawyer.email}</td>
                            <td className="py-2 px-4">{lawyer.specialization}</td>
                            <td className="py-2 px-4">
                              <a
                                href={`/chat/${lawyer._id}`}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                              >
                                Chat
                              </a>
                            </td>
                            <td className="py-2 px-4">
                              <button
                                onClick={() => navigate(`/lawyer/${lawyer._id}`)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                              >
                                View Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                        {lawyers.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center py-4">
                              No active approved lawyers found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === "Tab3" && (
                <div className="p-4 border rounded bg-gray-100 ">                
                <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold mb-4">New Lawyer Management</h2>
                  </div>
                    <table className="min-w-full bg-white border border-gray-300">
                      <thead>
                        <tr className="bg-gray-200 text-left">
                          <th className="py-2 px-4 border">Name</th>
                          <th className="py-2 px-4 border">Email</th>
                          <th className="py-2 px-4 border">Documents</th>
                          <th className="py-2 px-4 border">Actions</th>
                          <th className="py-2 px-4 border">View Detial</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lawyers.map((lawyer) => (
                          <tr key={lawyer._id} className="border-b">
                            <td className="py-2 px-4 flex gap-5">
                              <img
                                src={`http://localhost:4000/uploads/${lawyer.profilePicture}`} // Adjust the path to match your backend
                                alt={`${lawyer.firstName}'s Profile`}
                                className="h-10 w-10 rounded-full hover:rounded-2xl"
                                onError={(e) =>
                                  (e.target.src = "/uploads/default_avatar.png") // Default avatar fallback
                                }
                              />
                              {lawyer.firstName} {lawyer.lastName}
                            </td>
                            <td className="py-2 px-4">{lawyer.email}</td>
                            <td className="py-2 px-4 space-y-1">
                              <div>
                                {renderDocumentLink(lawyer.barCertificate, "Bar Certificate")}
                              </div>
                              <div>
                                {renderDocumentLink(
                                  lawyer.additionalCertifications,
                                  "Additional Certifications"
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-4 space-x-2">
                              <button
                                onClick={() => handleApprove(lawyer._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(lawyer._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              >
                                Reject
                              </button></td>
                              <td>
                              <button
                                onClick={() => navigate(`/lawyer/${lawyer._id}`)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                              >
                                View Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                        {lawyers.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center py-4">
                              No unapproved lawyers found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  
                </div>
              )}
              {activeTab === "Tab4" && (
                <div className="overflow-x-auto p-5">
                <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold mb-4">User Management</h1>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-4 bg-gray-800 bg-opacity-50 rounded-lg px-4 py-2">
                    <img src={searchIcon} alt="Search" className="w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent border-none outline-none text-white w-full"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-800 text-white px-3 py-2 rounded-lg outline-none"
                  >
                    <option value="all">All ({users.length})</option>
                    <option value="active">Active ({filteredUsers.filter(u => u.state === "Active").length})</option>
                    <option value="inactive">Inactive ({filteredUsers.filter(u => u.state === "Inactive").length})</option>
                  </select>

                  {/* User Type Filter */}
                  <select
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    className="bg-gray-800 text-white px-3 py-2 rounded-lg outline-none"
                  >
                    <option value="all">All User Types</option>
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select> </div>
                  </div>

                  <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2">#</th>
                        <th className="border border-gray-300 px-4 py-2">Name</th>
                        <th className="border border-gray-300 px-4 py-2">Email</th>
                        <th className="border border-gray-300 px-4 py-2">User Type</th>
                        <th className="border border-gray-300 px-4 py-2">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr key={user._id} className="hover:bg-gray-200">
                          <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                          <td className="py-2 px-4 flex items-center gap-2 border border-gray-300">
                            <img
                              src={`http://localhost:4000${user.profilePicture}`} // Adjust the path to match your backend
                              alt={`${user.firstName}'s Profile`}
                              className="h-10 w-10 rounded-full hover:rounded-2xl"
                              onError={(e) =>
                                (e.target.src = "http://localhost:4000/uploads/default_avatar.png") // Default avatar fallback
                              }
                            />
                            {user.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                          <td className="border border-gray-300 px-4 py-2">{user.userType}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-white ${user.state === "Active" ? "bg-green-500" : "bg-red-500"
                                }`}
                            >
                              {user.state}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === "Tab5" && (
                <div className="rounded bg-gray-100">
                  <div className="p-2 border rounded bg-gray-100">
                    <div className="container mx-auto p-4">
                      <h2 className="text-2xl font-bold mb-4">Unapproved Lawyers</h2>
                      <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                          <tr className="bg-gray-200 text-left">
                            <th className="py-2 px-4 border">Name</th>
                            <th className="py-2 px-4 border">Email</th>
                            <th className="py-2 px-4 border">Specialization</th>
                            <th className="py-2 px-4 border">Chat</th>
                            <th className="py-2 px-4 border">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lawyers.map((lawyer) => (
                            <tr key={lawyer._id} className="border-b">
                              <td className="py-2 px-4">
                                <img
                                  src={`http://localhost:4000/uploads/${lawyer.profilePicture}`} // Adjust the path to match your backend
                                  alt={`${lawyer.firstName}'s Profile`}
                                  className="h-10 w-10 rounded-full hover:rounded-2xl"
                                  onError={(e) =>
                                    (e.target.src = "/uploads/default_avatar.png") // Default avatar fallback
                                  }
                                />
                                {lawyer.firstName} {lawyer.lastName}
                              </td>
                              <td className="py-2 px-4">{lawyer.email}</td>
                              <td className="py-2 px-4">{lawyer.specialization}</td>
                              <td className="py-2 px-4">
                                <a
                                  href={`/chat/${lawyer._id}`}
                                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                >
                                  Chat
                                </a>
                              </td>
                              <td className="py-2 px-4">
                                <button
                                  onClick={() => navigate(`/lawyer/${lawyer._id}`)}
                                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                >
                                  View Detail
                                </button>
                              </td>
                            </tr>
                          ))}
                          {lawyers.length === 0 && (
                            <tr>
                              <td colSpan="5" className="text-center py-4">
                                No unapproved lawyers found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </center>
      </main></div>
      </div>
  );
};

export default LawyerManagement;
