import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login"); // Redirect to login if user data is missing
    } else {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error.message);
        localStorage.removeItem("user"); // Clear invalid data
        navigate("/login");
      }
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <img src={user.profilePicture} alt="Profile" width="100" onError={(e) => e.target.src = "/uploads/default_avatar.png"} />
    </div>
  );
};

export default Dashboard;
