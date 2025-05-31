import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Nave from "./Nave";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear token and user info from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.info("Logged out successfully!", { position: "top-right" });

    // Redirect to login page
    navigate("/login");
  }, [navigate]);

  return (
  <>
  <Nave />
  <p>Logging out...</p>;</>);
};

export default Logout;
