import { useEffect, useState } from "react";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [caseDescription, setCaseDescription] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch reports from the backend
  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/reports");
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle new report submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newReport = {
      reportedUser: "USER_ID_HERE",
      reportedUserEmail: "user@example.com",
      reportedUserType: "User",
      caseDescription,
    };

    try {
      const response = await fetch("http://localhost:4000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });

      if (response.ok) {
        alert("Report submitted!");
        fetchReports();
        setCaseDescription("");
      } else {
        alert("Failed to submit report.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  // Handle report status update
  const handleUpdate = async (reportId, newStatus) => {
    try {
      await fetch(`http://localhost:4000/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  // Handle report deletion
  const handleDelete = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      await fetch(`http://localhost:4000/api/reports/${reportId}`, { method: "DELETE" });
      fetchReports();
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">User Reports</h2>

      {/* Create Report Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full border p-2 rounded-lg"
          rows="3"
          placeholder="Describe the case..."
          value={caseDescription}
          onChange={(e) => setCaseDescription(e.target.value)}
          required
        ></textarea>
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Submit Report
        </button>
      </form>

      {/* Reports Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report._id} className="border">
              <td className="p-2">{report.reportedUser?.name || "Unknown"}</td>
              <td className="p-2">{report.reportedUserEmail}</td>
              <td className="p-2">{report.reportedUserType}</td>
              <td className="p-2">{report.caseDescription}</td>
              <td className="p-2">{report.status}</td>
              <td className="p-2">
                <button onClick={() => handleUpdate(report._id, "Reviewed")} className="mr-2 bg-yellow-500 text-white px-2 py-1 rounded">
                  Mark Reviewed
                </button>
                <button onClick={() => handleDelete(report._id)} className="bg-red-500 text-white px-2 py-1 rounded">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportList;
