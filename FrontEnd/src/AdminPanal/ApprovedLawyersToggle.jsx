import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import searchIcon from "../chate/image/search.png";

const ApprovedLawyersToggle = () => {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'

  // Fetch approved lawyers from backend
  const fetchLawyers = () => {
    fetch("http://localhost:4000/api/lawyers/approved")
      .then((res) => res.json())
      .then((data) => {
        setLawyers(data);
        setFilteredLawyers(data); // Initialize the filtered lawyers list
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch approved lawyers");
      });
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  // Calculate total numbers for each category
  const totalAll = lawyers.length;
  const totalActive = lawyers.filter((lawyer) => lawyer.states).length;
  const totalInactive = lawyers.filter((lawyer) => !lawyer.states).length;

  // Apply filters: search term and status
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = lawyers.filter((lawyer) => {
      const matchesSearch =
        lawyer.firstName.toLowerCase().includes(lowercasedSearchTerm) ||
        lawyer.lastName.toLowerCase().includes(lowercasedSearchTerm) ||
        lawyer.email.toLowerCase().includes(lowercasedSearchTerm);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && lawyer.states) ||
        (statusFilter === "inactive" && !lawyer.states);
      return matchesSearch && matchesStatus;
    });
    setFilteredLawyers(filtered);
  }, [searchTerm, statusFilter, lawyers]);

  // Toggle activation status for a lawyer
  const toggleState = (id) => {
    fetch(`http://localhost:4000/api/lawyers/toggle-state/${id}`, {
      method: "PUT",
    })
      .then((res) => res.json())
      .then((updatedLawyer) => {
        setLawyers((prevLawyers) =>
          prevLawyers.map((lawyer) =>
            lawyer._id === id ? { ...lawyer, states: updatedLawyer.states } : lawyer
          )
        );
        toast.success(`Lawyer ${updatedLawyer.states ? "activated" : "deactivated"} successfully`);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to update lawyer state");
      });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Approved Lawyers</h2>
        <div className="flex items-center gap-4">
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
            <option value="all">All ({totalAll})</option>
            <option value="active">Active ({totalActive})</option>
            <option value="inactive">Inactive ({totalInactive})</option>
          </select>
          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg outline-none">
            <Link to="/LawyerSignupPage" className="text-xl hover:text-3xl">
              Add Lawyer
            </Link>
          </div>
        </div>
      </div>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Specialized On </th>
            <th className="py-2 px-4 border">Status</th>
            <th className="py-2 px-4 border">Action</th>
            <th className="py-2 px-4 border">Detail</th>
          </tr>
        </thead>
        <tbody>
          {filteredLawyers.map((lawyer) => (
            <tr key={lawyer._id} className="border-b">
              <td className="py-2 px-4 flex items-center gap-2">
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
              <td className="py-2 px-4">{lawyer.states ? "Active" : "Inactive"}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => toggleState(lawyer._id)}
                  className={`px-3 py-1 rounded text-white ${lawyer.states ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                  {lawyer.states ? "Deactivate" : "Activate"}
                </button>
              </td>
              <td className="py-2 px-4 space-x-2">
                <button
                  onClick={() => navigate(`/lawyer/${lawyer._id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  View Detail
                </button>
              </td>
            </tr>
          ))}
          {filteredLawyers.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No approved lawyers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApprovedLawyersToggle;
