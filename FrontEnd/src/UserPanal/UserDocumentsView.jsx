import { useState, useEffect } from "react";
import axios from "axios";
import UserDashboard from "./UserDashboard";
import UserSideBar from "./UserSideBar";
import Nave from "../Pages/Nave";

const UserDocumentsView = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/legal-documents"
        );
        setDocuments(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);
 const viewDocument = (filePath) => {
    window.open(`http://localhost:4000${filePath}`, '_blank');
  };

  if (loading) return <div className="text-center py-8">Loading documents...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error}</div>;

  return (
    <>
      <Nave/>
      <div className="grid md:grid-cols-4">
        <UserSideBar />
        <div className="container mx-auto p-5 col-span-3">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Legal Documents</h1>

            {documents.length === 0 ? (
              <p className="text-gray-500">No documents available.</p>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {doc.filePath.split("/").pop()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doc.fileType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {doc.uploaderName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doc.uploaderEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <button
                      onClick={() => viewDocument(doc.filePath)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View & download
                    </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDocumentsView;
