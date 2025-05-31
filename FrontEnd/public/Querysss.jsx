import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ManagerSideBar from "../ManagerPage/ManagerSideBar";

const LawyerDetail = () => {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:4000/api/lawyers/${id}`)
      .then((res) => res.json())
      .then((data) => setLawyer(data))
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch lawyer details");
      });
  }, [id]);

  if (!lawyer) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="grid md:grid-cols-4">
      <ManagerSideBar />
    <div className="container mx-auto p-4 col-span-3">
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-500 text-white px-3 py-1 rounded mb-4 hover:bg-gray-600"
      >
        Back
      </button>
      <div className="md:pl-56 p-6  bg-gray-300 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Lawyer Details</h2>
        <p className="py-2 px-4">
          <img
            src={`http://localhost:4000/uploads/${lawyer.profilePicture}`} // Adjust the path to match your backend
            alt={`${lawyer.firstName}'s Profile`}
            className="h-30 w-30 rounded-full hover:rounded-2xl"
            onError={(e) =>
              (e.target.src = "/uploads/default_avatar.png") // Default avatar fallback
            }
          />
        </p>
        <p>
          <strong>Name:</strong> {lawyer.firstName} {lawyer.lastName}
        </p>
        <p>
          <strong>Email:</strong> {lawyer.email}
        </p>
        <p>
          <strong>Phone:</strong> {lawyer.phone}
        </p>
        <p>
          <strong>Gender:</strong> {lawyer.gender}
        </p>
        <p>
          <strong>Date of Birth:</strong>{" "}
          {new Date(lawyer.dob).toLocaleDateString()}
        </p>
        <p>
          <strong>Address:</strong> {lawyer.streetAddress}, {lawyer.city},{" "}
          {lawyer.region}, {lawyer.postalCode}
        </p>
        <p>
          <strong>License Number:</strong> {lawyer.licenseNumber}
        </p>
        <p>
          <strong>Years of Experience:</strong> {lawyer.yearsOfExperience}
        </p>
        <p>
          <strong>Specialization:</strong> {lawyer.specialization.join(", ")}
        </p>
        <p>
          <strong>languagesSpoken:</strong> {lawyer.languagesSpoken.join(", ")}
        </p>
        <p>
          <strong>lawDegree:</strong> {lawyer.lawDegree}
        </p>
        <p>
          <strong>university Name:</strong> {lawyer.universityName}
        </p>
        <p>
          <strong>graduation Year:</strong> {lawyer.graduationYear} E.C
        </p>
        <p>
          <strong>Consultation Fee:</strong> {lawyer.consultationFee}
        </p>
        <p>
          <strong>Availability:</strong> {lawyer.availability}
        </p>
        <p>
          <strong>caseCapacity:</strong> {lawyer.caseCapacity}
        </p>
        <p>
          <strong>Preferred Mode:</strong> {lawyer.preferredMode.join(", ")}
        </p>
        {/* Add additional fields as needed */}
      </div>
    </div></div>
  );
};

export default LawyerDetail;
