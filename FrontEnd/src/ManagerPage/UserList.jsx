import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import searchIcon from "../chate/image/search.png";  // Assuming you have a search icon
import ManagerSideBar from "./ManagerSideBar";

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  //const [userToDelete, setUserToDelete] = useState(null);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
 // const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [counts, setCounts] = useState({ user: 0, manager: 0, admin: 0 });

  // Fetch user data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:4000/api/users/users", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Users:", data); // Debugging log
    
          if (Array.isArray(data)) {
            setUsers(data);
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
  }, []);

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

  return (
    <div className="grid md:grid-cols-4">
      <ManagerSideBar />
      <div className="col-span-3 overflow-x-auto mt-5 p-5">
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
              <th className="border border-gray-300 px-4 py-2">Actions</th>
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
                <td className="border border-gray-300 px-4 py-2 flex gap-2">
                  <button
                    onClick={() => navigate(`/chate/${user._id}`, { state: { username: user.name } })}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => navigate(`/report/${user._id}`, { state: { username: user.name } })}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
  );
};

export default UserList;