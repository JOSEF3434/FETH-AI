import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import avater from '../chate/image/avatar.png'
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UserSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("User");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(avater);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      setProfilePicture(file);
      
      // Generate preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("userType", userType);
    formData.append("password", password);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    try {
      const response = await fetch("http://localhost:4000/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Something went wrong.");
      } else {
        toast.success("Account created successfully!");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setError("Signup failed. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-4">Sign Up</h2>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} 
            onChange={(e) => setName(e.target.value)} required
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
          <input type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            className="border border-gray-300 rounded-lg p-2 w-full"
          />

          <input type="text" value={userType} readOnly
            className="border border-gray-300 rounded-lg p-2 w-full bg-gray-100"
          />

          {/* Profile Picture Upload */}
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="fileUpload" />
            <label htmlFor="fileUpload" className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
              {imageLoading ? "Uploading..." : "Select Picture"}
            </label>
            {preview && <img src={preview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />}
          </div>

          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} 
              onChange={(e) => setPassword(e.target.value)} required 
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} required 
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" 
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition">
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div></>
  );
};

export default UserSignup;
