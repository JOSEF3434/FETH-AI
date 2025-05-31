import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import moreIcon from './image/more.png';
import editIcon from './image/edit.png';

const Userinfo = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const storedUser = localStorage.getItem("user");
  
      if (!storedUser) {
        navigate("/login"); // Redirect to login if user data is missing
      } else {
        try {
          setUser(JSON.parse(storedUser));
          //console.log(storedUser);
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
        <div className="p-5 flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center gap-5">
                <img 
                    src={user.profilePicture} 
                    alt="User Avatar" 
                    className="w-12 h-12 rounded-full object-cover"
                />
                <h1 className="text-white text-lg font-semibold"> {user.name}</h1>
            </div>
           
            {/* Icons */}
            <div className="flex">
                <img 
                    src={moreIcon} 
                    alt="More" 
                    className="w-5 h-5 mx-2 cursor-pointer hover:opacity-80"
                />
                <img 
                    src={editIcon} 
                    alt="Edit" 
                    className="w-5 h-5 mx-2 cursor-pointer hover:opacity-100"
                />
            </div>
        </div>
    );
};

export default Userinfo;
