import { useState, useEffect } from "react";
import LawyerSideBar from "./LawyerSideBar";

export default function LegalDocumentUpload() {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); // Get user from local storage

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/legal-documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !user) {
      alert("Please select a file and make sure you are logged in.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploaderName", user.name);
    formData.append("uploaderEmail", user.email);

    try {
      const response = await fetch("http://localhost:4000/api/legal-documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("File uploaded successfully!");
        setDocuments([...documents, data.document]); // Update state
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (<>
        <div className="grid md:grid-cols-4">
          <LawyerSideBar />
          <div className="container mx-auto p-5 col-span-3">
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload Legal Document</h2>
      <input type="file" onChange={handleFileChange} className="mb-3 p-2 border rounded w-full" />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Upload
      </button>

      <h3 className="text-lg font-semibold mt-6">Uploaded Documents</h3>
      <ul className="mt-3 space-y-2">
        {documents.map((doc) => (
          <li key={doc._id} className="p-2 bg-gray-100 rounded flex justify-between items-center">
            <span>{doc.filePath.split("/").pop()}</span>
            <a href={`http://localhost:4000${doc.filePath}`} target="_blank" className="text-blue-600">
              View
            </a>
          </li>
        ))}
      </ul>
    </div></div></div></>
  );
}
