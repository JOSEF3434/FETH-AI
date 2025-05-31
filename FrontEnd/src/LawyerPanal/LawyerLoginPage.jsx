import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaSignInAlt, FaUser, FaLock } from "react-icons/fa";

const LawyerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/lawyers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Validate response
      if (!data.lawyer || !data.lawyer._id || !data.token) {
        throw new Error("Invalid login response from server");
      }

      // Process profile picture
      const getProfilePictureUrl = (profilePicture) => {
        if (!profilePicture) return null;
        if (profilePicture.includes("http")) return profilePicture;
        if (profilePicture.startsWith("/uploads/")) {
          return `http://localhost:4000${profilePicture}`;
        }
        return `http://localhost:4000/uploads/${profilePicture}`;
      };

      const profilePicUrl = getProfilePictureUrl(data.lawyer.profilePicture);

      // Prepare user data
      const userData = {
        _id: data.lawyer._id,
        name:
          data.lawyer.name ||
          `${data.lawyer.firstName || ""} ${data.lawyer.lastName || ""}`.trim(),
        email: data.lawyer.email,
        profilePicture: profilePicUrl,
        userType: "Lawyer",
        licenseNumber: data.lawyer.licenseNumber,
        specialization: data.lawyer.specialization
          ? Array.isArray(data.lawyer.specialization)
            ? data.lawyer.specialization
            : [data.lawyer.specialization]
          : [],
        city: data.lawyer.city,
        region: data.lawyer.region,
        languagesSpoken: data.lawyer.languagesSpoken
          ? Array.isArray(data.lawyer.languagesSpoken)
            ? data.lawyer.languagesSpoken
            : [data.lawyer.languagesSpoken]
          : ["English"],
        yearsOfExperience: data.lawyer.yearsOfExperience || 0,
        token: data.token, 
      };
console.log("the loged in lawyer license number is :  ",userData.licenseNumber),
      // Store data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Success
      toast.success("Login successful!", {
        position: "top-right",
        onClose: () => navigate("/lawyerdashboard"),
      });
    } catch (error) {
      setError(error.message);
      console.error("Login error:", error);
      toast.error(error.message, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="p-8 md:p-2">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Lawyer Login
              </h1>
              <p className="text-gray-600">
                Sign in to your professional dashboard
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/lawyer/signup"
                  className="text-blue-600 hover:underline"
                >
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LawyerLogin;
