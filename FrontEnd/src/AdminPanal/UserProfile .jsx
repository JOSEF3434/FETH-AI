import { useState, useEffect } from "react";
import SideBar from "./SideBar";

const UpdateProfile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    profilePicture: "",
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log(storedUser);
    if (storedUser) {
      setUser({
        name: storedUser.name,
        email: storedUser.email,
        password: "",
        profilePicture: storedUser.profilePicture,
      });
      setPreview(storedUser.profilePicture);
    }
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUser({ ...user, profilePicture: file });

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };
 
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id; // Correct way to get user ID

  console.log("Retrieved userId:", userId);

  if (!userId) {
    alert("User ID not found. Please log in again.");
    window.location.href = "/login"; // Redirect to login
    return;
  }

  const formData = new FormData();
  formData.append("name", user.name);
  formData.append("email", user.email);
  if (user.password) formData.append("password", user.password);
  if (user.profilePicture instanceof File) {
    formData.append("profilePicture", user.profilePicture);
  }

  try {
    const response = await fetch(`http://localhost:4000/api/users/update/${userId}`, {
      method: "PUT",
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(data.user)); // Update local storage
      setMessage("Profile updated successfully!");
    } else {
      setMessage(data.error || "Update failed");
    }
  } catch (error) {
    setMessage("Error updating profile");
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  
  return (
  <div className='grid md:grid-cols-4'>
      <SideBar/>
    <div className="flex flex-col col-span-3 items-center p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>

      {message && <p className="text-center text-green-600">{message}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <div className="mb-4">
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">New Password (Optional)</label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border p-2 rounded" />
          {preview && <img src={preview} alt="Preview" className="mt-2 w-24 h-24 rounded-full" />}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
    </div>
  );
};

export default UpdateProfile;
