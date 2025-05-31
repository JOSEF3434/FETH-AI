import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import searchIcon from "../chate/image/search.png";  // Assuming you have a search icon

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
    const [userToDelete, setUserToDelete] = useState(null);
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); 
  const [counts, setCounts] = useState({ user: 0, manager: 0, admin: 0 });
  const [currentUser, setCurrentUser] = useState(null); // Store current user info
  
  // Get current user from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({
          id: decoded.userId,
          userType: decoded.userType // Make sure your JWT includes userType
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:4000/api/legal/users", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
    
        if (response.ok) {
          const users = await response.json(); // Now this is directly the array
          
          setUsers(users);
    
          // Count user types
          const userCounts = {
            user: users.filter((u) => u.userType === "User").length,
            manager: users.filter((u) => u.userType === "Manager").length,
            admin: users.filter((u) => u.userType === "Admin").length,
          };
          setCounts(userCounts);
        } else {
          console.error("Failed to fetch users:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Handle toggle activation state
const toggleActivation = async (id, isActive) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:4000/api/users/${id}/state`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        state: isActive ? "Inactive" : "Active" 
      }),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || "Invalid response from server");
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user status');
    }

    setUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === id ? { ...user, state: data.user.state } : user
      )
    );
    
    alert(`User ${isActive ? 'deactivated' : 'activated'} successfully!`);
  } catch (error) {
    console.error("Update error:", error);
    alert(`Error: ${error.message}`);
  }
};

// Delete User - Improved version
const deleteUser = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:4000/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete user');
    }

    setUsers(prevUsers => prevUsers.filter(user => user._id !== id));
    setShowConfirmDialog(false);
    alert('User deleted successfully!');
  } catch (error) {
    console.error("Delete error:", error);
    alert(`Error: ${error.message}`);
  }
};
  // Handle delete user
  const deleteUserq = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage
      const response = await fetch(`http://localhost:4000/api/users/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowConfirmDialog(true);
  };
  //console.log(deleteUserq)

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-2">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* User Counts 
      <div className="mb-4">
        <p className="font-medium">User Counts:</p>
        <ul className="list-disc ml-6">
          <li>Users: {counts.user}</li>
          <li>Managers: {counts.manager}</li>
          <li>Admins: {counts.admin}</li>
        </ul>
      </div>
*/}
      <div className="flex items-center gap-4 mb-6">
        {/* Search Bar */}
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
        </select>

        {/* Add Lawyer Link */}
        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg outline-none">
          <Link to="/AddUser" className="text-xl hover:text-3xl">
            Add User
          </Link>
        </div>
      </div>
</div>
      {/* User Table */}
      <div className="overflow-x-auto">
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
  {filteredUsers.map((user,index) => (
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
                    className={`px-2 py-1 rounded text-white ${
                      user.state === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {user.state}
                  </span>
                </td>
                 <td className="border border-gray-300 px-4 py-2 space-x-2">
        {/* Only show buttons if not the current user */}
        {currentUser && user._id !== currentUser.id ? (
          <>
                  {/* Toggle Activation */}
                  <button
                    onClick={() => toggleActivation(user._id, user.state === "Active")}
                    className={`px-3 py-1 text-sm rounded ${
                      user.state === "Active"
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {user.state === "Active" ? "Deactivate" : "Activate"}
                  </button>

                  {/* Delete User */}
                <button
                  onClick={() => confirmDelete(user)}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                </>)
                : (
          <span className="text-gray-500">Current user</span>
        )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <p>Are you sure you want to delete {userToDelete?.name}?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(userToDelete._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserManagement;
