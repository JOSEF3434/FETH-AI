import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const LawyerUnapprovedList = () => {
  const [lawyers, setLawyers] = useState([]);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Fetch unapproved lawyers (approved: false and states: false)
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
        // Remove approved lawyer from unapproved list
        setLawyers(lawyers.filter((lawyer) => lawyer._id !== id));
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
        setLawyers(lawyers.filter((lawyer) => lawyer._id !== id));
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to reject lawyer");
      });
  };

  // Open View Detail modal
  const handleViewDetail = (lawyer) => {
    setSelectedLawyer(lawyer);
    setShowDetail(true);
  };

  // Close detail modal
  const closeDetail = () => {
    setShowDetail(false);
    setSelectedLawyer(null);
  };

  // Render download link for a document if available
  const renderDocumentLink = (docField, label) => {
    if (docField) {
      // Assuming docField holds a URL or file name (adjust URL if needed)
      return (
        <a
          href={docField}
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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">New Lawyer Registrations</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
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
                {lawyer.firstName} {lawyer.lastName}
              </td>
              <td className="py-2 px-4">{lawyer.email}</td>
              <td className="py-2 px-4 space-y-1">
                <div>
                  {renderDocumentLink(lawyer.profilePicture, "Profile Picture")}
                </div>
                <div>
                  {renderDocumentLink(lawyer.barCertificate, "Bar Certificate")}
                </div>
                <div>
                  {renderDocumentLink(lawyer.additionalCertifications, "Additional Certs")}
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
                  onClick={() => handleViewDetail(lawyer)}
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
                No unapproved lawyers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Detail Modal */}
      {showDetail && selectedLawyer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded shadow-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Lawyer Details</h3>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedLawyer.firstName} {selectedLawyer.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedLawyer.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedLawyer.phone}
              </p>
              <p>
                <strong>Gender:</strong> {selectedLawyer.gender}
              </p>
              <p>
                <strong>Date of Birth:</strong> {new Date(selectedLawyer.dob).toLocaleDateString()}
              </p>
              <p>
                <strong>Address:</strong> {selectedLawyer.streetAddress}, {selectedLawyer.city},{" "}
                {selectedLawyer.region}, {selectedLawyer.postalCode}
              </p>
              <p>
                <strong>License Number:</strong> {selectedLawyer.licenseNumber}
              </p>
              <p>
                <strong>Years of Experience:</strong> {selectedLawyer.yearsOfExperience}
              </p>
              <p>
                <strong>Specialization:</strong> {selectedLawyer.specialization.join(", ")}
              </p>
              <p>
                <strong>Consultation Fee:</strong> {selectedLawyer.consultationFee}
              </p>
              <p>
                <strong>Availability:</strong> {selectedLawyer.availability}
              </p>
              <p>
                <strong>Preferred Mode:</strong> {selectedLawyer.preferredMode.join(", ")}
              </p>
              {/* Render document links in detail view */}
              <p>
                <strong>Profile Picture:</strong>{" "}
                {renderDocumentLink(selectedLawyer.profilePicture, "Download") }
              </p>
              <p>
                <strong>Bar Certificate:</strong>{" "}
                {renderDocumentLink(selectedLawyer.barCertificate, "Download") }
              </p>
              <p>
                <strong>Additional Certifications:</strong>{" "}
                {renderDocumentLink(selectedLawyer.additionalCertifications, "Download") }
              </p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={closeDetail}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerUnapprovedList;
