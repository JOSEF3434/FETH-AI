import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { FaEye, FaEyeSlash, FaSave, FaEdit, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const UpdateLawyerProfile = () => {
  const { currentUser: user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    profilePicture: "",
    gender: "",
    dob: "",
    country: "Ethiopia",
    region: "",
    city: "",
    streetAddress: "",
    postalCode: "",
    licenseNumber: "",
    barCertificate: "",
    yearsOfExperience: "",
    specialization: [],
    courtRepresentation: "",
    languagesSpoken: [],
    lawDegree: "",
    universityName: "",
    graduationYear: "",
    additionalCertifications: null,
    consultationFee: "",
    availability: "",
    preferredMode: [],
    caseCapacity: "",
  });

  useEffect(() => {
    const fetchLawyerProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/lawyers/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setFormData(response.data);
        if (response.data.profilePicture) {
          setPreview(
            `http://localhost:4000/uploads/${response.data.profilePicture
              .split("/")
              .pop()}`
          );
        }
      } catch (error) {
        console.error("Failed to fetch lawyer profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchLawyerProfile();
  }, [user._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    if (file) {
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Show preview for profile picture only
      if (name === "profilePicture") {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleMultiSelectChange = (e, field) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setFormData((prev) => ({
      ...prev,
      [field]: selectedValues,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      const originalData = await axios.get(
        `http://localhost:4000/api/lawyers/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Compare and only send changed values
      Object.keys(formData).forEach((key) => {
        // Skip password if it's empty (not changed)
        if (key === "password" && !formData[key]) {
          return;
        }

        // Skip file fields if not changed
        if (
          [
            "profilePicture",
            "barCertificate",
            "additionalCertifications",
          ].includes(key)
        ) {
          if (formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
          return;
        }

        // For arrays, compare if they're different
        if (Array.isArray(formData[key])) {
          const originalArray = originalData.data[key] || [];
          const newArray = formData[key];

          if (
            JSON.stringify(originalArray.sort()) !==
            JSON.stringify(newArray.sort())
          ) {
            newArray.forEach((item) => {
              formDataToSend.append(key, item);
            });
          }
          return;
        }

        // For other fields, only send if changed
        if (formData[key] !== originalData.data[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Debug what's being sent
      console.log("Sending to backend:");
      for (let [key, val] of formDataToSend.entries()) {
        console.log(key, val);
      }

      const response = await axios.put(
        `http://localhost:4000/api/lawyers/${user._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          timeout: 30000,
        }
      );

      toast.success("Profile updated successfully!");
      setEditing(false);
      setFormData(response.data.lawyer);
    } catch (error) {
      console.error("Update error:", error);
      let errorMessage = "Failed to update profile";

      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.request) {
        errorMessage = "No response received from server";
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleEditing = () => {
    setEditing(!editing);
    if (editing) {
      // Reset form data if canceling edit
      // You might want to reload the original data here
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Lawyer Profile</h1>
            <div className="flex space-x-2">
              {editing ? (
                <>
                  <button
                    onClick={toggleEditing}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    <FaTimes className="mr-2" /> Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                  >
                    <FaSave className="mr-2" />{" "}
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleEditing}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition"
                >
                  <FaEdit className="mr-2" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Personal Info */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    {editing && (
                      <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600">
                        <input
                          type="file"
                          name="profilePicture"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <FaEdit />
                      </label>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">
                    {formData.firstName} {formData.lastName}
                  </h2>
                  <p className="text-gray-600">
                    {formData.specialization?.join(", ")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.phone}
                      </p>
                    )}
                  </div>

                  {editing && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Leave blank to keep current"
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-3 text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    {editing ? (
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.gender}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    {editing ? (
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob?.split("T")[0] || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {new Date(formData.dob).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Column - Address and Professional Info */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                  Address Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.region}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.streetAddress}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4 border-b pb-2">
                  Professional Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.licenseNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bar Certificate
                    </label>
                    {editing ? (
                      <div>
                        <input
                          type="file"
                          name="barCertificate"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        {typeof formData.barCertificate === "string" && (
                          <p className="text-sm text-gray-500 mt-1">
                            Current: {formData.barCertificate.split("/").pop()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {typeof formData.barCertificate === "string" ? (
                          <a
                            href={`http://localhost:4000/uploads/${formData.barCertificate
                              .split("/")
                              .pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View Certificate
                          </a>
                        ) : (
                          "Not uploaded"
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.yearsOfExperience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consultation Fee (ETB)
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.consultationFee}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Education and Availability */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                  Education
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Law Degree
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="lawDegree"
                        value={formData.lawDegree}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.lawDegree}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      University
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="universityName"
                        value={formData.universityName}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.universityName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Graduation Year
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.graduationYear}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Certifications
                    </label>
                    {editing ? (
                      <div>
                        <input
                          type="file"
                          name="additionalCertifications"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        {typeof formData.additionalCertifications ===
                          "string" && (
                          <p className="text-sm text-gray-500 mt-1">
                            Current:{" "}
                            {formData.additionalCertifications.split("/").pop()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {typeof formData.additionalCertifications ===
                        "string" ? (
                          <a
                            href={`http://localhost:4000/uploads/${formData.additionalCertifications
                              .split("/")
                              .pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View Certificate
                          </a>
                        ) : (
                          "Not uploaded"
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4 border-b pb-2">
                  Specialization & Languages
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization Areas
                    </label>
                    {editing ? (
                      <div>
                        <select
                          multiple
                          name="specialization"
                          value={formData.specialization}
                          onChange={(e) =>
                            handleMultiSelectChange(e, "specialization")
                          }
                          className="w-full p-2 border border-gray-300 rounded-md h-auto"
                        >
                          <option value="Criminal Law">Criminal Law</option>
                          <option value="Family Law">Family Law</option>
                          <option value="Business Law">Business Law</option>
                          <option value="Immigration Law">
                            Immigration Law
                          </option>
                          <option value="Intellectual Property">
                            Intellectual Property
                          </option>
                          <option value="Employment Law">Employment Law</option>
                          <option value="Human Rights Law">
                            Human Rights Law
                          </option>
                          <option value="Real Estate Law">
                            Real Estate Law
                          </option>
                          <option value="Tax Law">Tax Law</option>
                          <option value="Personal Injury Law">
                            Personal Injury Law
                          </option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Hold Ctrl/Cmd to select multiple
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.specialization?.join(", ") ||
                          "None specified"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Languages Spoken
                    </label>
                    {editing ? (
                      <div>
                        <select
                          multiple
                          name="languagesSpoken"
                          value={formData.languagesSpoken}
                          onChange={(e) =>
                            handleMultiSelectChange(e, "languagesSpoken")
                          }
                          className="w-full p-2 border border-gray-300 rounded-md h-auto"
                        >
                          <option value="English">English</option>
                          <option value="Amharic">Amharic</option>
                          <option value="Oromifa">Oromifa</option>
                          <option value="Tigrigna">Tigrigna</option>
                          <option value="French">French</option>
                          <option value="Arabic">Arabic</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Hold Ctrl/Cmd to select multiple
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.languagesSpoken?.join(", ") ||
                          "None specified"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Court Representation
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="courtRepresentation"
                        value={formData.courtRepresentation}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.courtRepresentation || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4 border-b pb-2">
                  Availability
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.availability || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Mode of Communication
                    </label>
                    {editing ? (
                      <div>
                        <select
                          multiple
                          name="preferredMode"
                          value={formData.preferredMode}
                          onChange={(e) =>
                            handleMultiSelectChange(e, "preferredMode")
                          }
                          className="w-full p-2 border border-gray-300 rounded-md h-auto"
                        >
                          <option value="In-Person">In-Person</option>
                          <option value="Video Call">Video Call</option>
                          <option value="Phone Call">Phone Call</option>
                          <option value="Email">Email</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Hold Ctrl/Cmd to select multiple
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded-md">
                        {formData.preferredMode?.join(", ") || "Not specified"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Capacity
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        name="caseCapacity"
                        value={formData.caseCapacity}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <p className="p-2 bg-gray-50 rounded-md">
                        {formData.caseCapacity || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UpdateLawyerProfile;
