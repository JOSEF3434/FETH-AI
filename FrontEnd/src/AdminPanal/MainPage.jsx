import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from "react-router-dom";
import searchIcon from "../chate/image/search.png";

ChartJS.register(ArcElement, Tooltip, Legend);

const UserMainPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Tab1");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all"); 
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }]
  });

  const tabs = [
    { id: "Tab1", label: "User Pichat " },
    { id: "Tab2", label: "Approved Lawyer`s" },
    { id: "Tab4", label: "All Users" },
  ];
 
  const PieChart = () => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const usersResponse = await fetch('http://localhost:4000/api/legal/count-by-type');
        const usersData = await usersResponse.json();
        
        // Fetch lawyer data
        const lawyersResponse = await fetch('http://localhost:4000/api/lawyers/count-approved');
        const lawyersData = await lawyersResponse.json();

        // Combine data
        const labels = ['Users', 'Managers', 'Admins', 'Lawyers'];
        const userCounts = [
          usersData.userCount || 0,
          usersData.managerCount || 0,
          usersData.adminCount || 0,
          lawyersData.count || 0
        ];

        // Calculate percentages
        const total = userCounts.reduce((sum, count) => sum + count, 0);
        const percentages = userCounts.map(count => 
          total > 0 ? Math.round((count / total) * 100) : 0
        );

        // Prepare chart data
        setChartData({
          labels: labels.map((label, i) => `${label} (${percentages[i]}%)`),
          datasets: [{
            data: userCounts,
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',  // Blue for Users
              'rgba(255, 206, 86, 0.7)',   // Yellow for Managers
              'rgba(255, 99, 132, 0.7)',    // Red for Admins
              'rgba(75, 192, 192, 0.7)'     // Teal for Lawyers
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1,
          }]
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
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

  // Fetch user data
  const fetchUsers = () => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage
        const response = await fetch("http://localhost:4000/api/legal/users", {
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

  useEffect(() => {
    if (activeTab === "Tab1") {
      PieChart();
    } else if (activeTab === "Tab2") {
      fetchapprovedLawyers();
    }else if (activeTab === "Tab4") {
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

  if (loading) return <div className="text-center py-8">Loading chart data...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <>
      <main className="flex-grow p-1 overflow-scroll bg-gray-100">
        <header className="bg-cyan-500 text-white rounded ">
          <div className="flex justify-between items-center relative p-3">
            <h1 className="text-4xl md:pl-36 text-center">Hello {user.name}, Welcome</h1>
            <button
              className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none"
            >
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="h-20 w-20  rounded-full hover:rounded-2xl"
                  onError={(e) => (e.target.src = "/uploads/default_avatar.png")}
                />
            </button>
          </div>
        </header>
        <center>
          <div className="p-4">
            {/* Tabs Header */}
            <div className="grid grid-cols-3 gap-4">
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
                    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Total User Account Distribution Piechart</h2>
                      <div className="h-96">
                        <Pie 
                          data={chartData} 
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right',
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {chartData.labels.map((label, index) => (
                          <div key={index} className="flex items-center">
                            <div 
                              className="w-4 h-4 mr-2 rounded-full" 
                              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                            ></div>
                            <span className="text-gray-700">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div></div>
              )}
              {activeTab === "Tab2" && (
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
            </div>
          </div>
        </center>
      </main>
    </>
  );
};

export default UserMainPage;
