import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LawyerActiveApprovedList from "../public/LawyerActiveApprovedList";

const UserMainPage = () => {
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
    <>
      <main className="flex-grow p-6 bg-gray-100">
        <header className="bg-cyan-500 text-white rounded ">
          <h1 className="text-4xl text-center p-3">Hello {user.name}, Welcome</h1>
          <p className="text-center justify-y-">this is the list of Lawyer</p>
        </header>
      <center>
        
    <LawyerActiveApprovedList/>
      </center>
      </main>
    </>
  );
};

export default UserMainPage;
