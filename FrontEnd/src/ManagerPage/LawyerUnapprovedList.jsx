import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LawyerUnapprovedList = () => {
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);

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
  };// Fetch unapproved lawyers
  const fetchLawyers = () => {
    fetch("http://localhost:4000/api/lawyers/unapproved")
      .then((res) => res.json())
      .then((data) => setLawyers(data))
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch lawyers");
      });
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

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

  // Reject lawyer
  const handleReject = (id) => {
    fetch(`http://localhost:4000/api/lawyers/reject/${id}`, {
      method: "PUT",
    })
      .then((res) => res.json())
      .then(() => {
        toast.success("Lawyer rejected successfully");
        setLawyers((prevLawyers) =>
          prevLawyers.filter((lawyer) => lawyer._id !== id)
        );
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to reject lawyer");
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">New Lawyer Registrations</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="py-2 px-4 border">Profile</th>
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Email</th>
            <th className="py-2 px-4 border">Documents</th>
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
              </td>
              <td className="py-2 px-4">
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
                </button>
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
  );
};

export default LawyerUnapprovedList;
