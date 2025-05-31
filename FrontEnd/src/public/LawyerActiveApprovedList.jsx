import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LawyerActiveApprovedList = () => {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);

  // Fetch lawyers with approved: true and states: true
  const fetchLawyers = () => {
    fetch("http://localhost:4000/api/lawyers/active-approved")
      .then((res) => res.json())
      .then((data) => setLawyers(data))
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch active approved lawyers");
      });
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  return (
    <div className="container mx-auto p-4 ">
      <h2 className="text-2xl font-bold mb-4">Active & Approved Lawyers</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">License Number</th>
            <th className="py-2 px-4 border">Chat</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {lawyers.map((lawyer) => (
            <tr key={lawyer._id} className="border-b">
              <td className="py-2 px-4">
                {lawyer.firstName} {lawyer.lastName}
              </td>
              <td className="py-2 px-4">{lawyer.email}</td>
              <td className="py-2 px-4">{lawyer.licenseNumber}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => navigate(`/chate/${lawyer._id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Chat
                </button>
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
  );
};

export default LawyerActiveApprovedList;
