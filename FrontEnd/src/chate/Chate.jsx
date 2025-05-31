import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Detail from "./Detail";
import Friend from "./friend";
import MessageBox from "./MessageBox";

const Chate = ({ currentUser }) => {
  const { userId } = useParams(); // Extract userId from the URL
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const friendRef = useRef(null);
  const detailRef = useRef(null);

  // Fetch user data when userId changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/api/users/${userId}`);
        if (response.ok) {
          const user = await response.json();
          setSelectedUser(user);
        } else {
          console.error("Failed to fetch user data");
          // Redirect back if user not found
          navigate(-1);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  // Handle user selection from both URL and Friends list
  const handleUserSelect = (user) => {
    // Update URL when selecting from friends list
    if (user._id !== userId) {
      navigate(`/chat/${user._id}`);
    }
    setSelectedUser(user);
  };

  // Close panels when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (friendRef.current && !friendRef.current.contains(event.target)) {
        setShowFriends(false);
      }
      if (detailRef.current && !detailRef.current.contains(event.target)) {
        setShowDetail(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen bg-gray-500 flex md:grid-cols-4">
      {/* Toggle Button for Friends List */}
      <button
        className="md:hidden rounded-lg absolute top-4 left-4 bg-gray-800 text-white p-2 z-10"
        onClick={() => setShowFriends((prev) => !prev)}
      >
        Friends
      </button>

      {/* Friends List */}
      <div
        ref={friendRef}
        className={`absolute md:relative md:flex w-64 h-screen bg-gray-900 transition-transform duration-300 ${
          showFriends ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 left-0 z-20`}
      >
        <Friend 
          setSelectedUser={handleUserSelect} 
          activeUserId={userId}
        />
      </div>

      {/* Message Box */}
      <div className="flex-1 md:col-span-2 h-full w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white">
            Loading chat...
          </div>
        ) : selectedUser ? (
          <MessageBox 
            key={selectedUser._id}
            selectedUser={selectedUser} 
            currentUser={currentUser} 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            {userId ? "User not found" : "Select a friend to chat"}
          </div>
        )}
      </div>

      {/* Toggle Button for Chat Detail */}
      <button
        className="md:hidden absolute top-4 right-4 bg-gray-800 text-white p-2 rounded z-10"
        onClick={() => setShowDetail((prev) => !prev)}
      >
        Details
      </button>

      {/* Chat Detail */}
      <div
        ref={detailRef}
        className={`absolute md:relative md:flex w-64 h-full bg-gray-900 transition-transform duration-300 ${
          showDetail ? "translate-x-0" : "translate-x-full"
        } md:translate-x-0 right-0 z-20`}
      >
        <Detail user={selectedUser} />
      </div>
    </div>
  );
};

export default Chate;