import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import searchIcon from "./image/search.png";
import plusIcon from "./image/plus.png";
import minusIcon from "./image/minus.png";
import Userinfo from "./Userinfo";
import PropTypes from "prop-types";

const Friend = ({ setSelectedUser }) => {
    const [addMode, setAddMode] = useState(false);
    const [users, setUsers] = useState([]);
    const [lawyers, setLawyers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const loggedInUserId = JSON.parse(localStorage.getItem("user"))?._id;
    const [lastMessages, setLastMessages] = useState({});
    const [unseenCounts, setUnseenCounts] = useState({});
    const [lastMessageTimes, setLastMessageTimes] = useState({});

    const fetchChatData = useCallback(async () => {
        if (!loggedInUserId) return;

        try {
            // 1. Fetch all users and lawyers
            const [usersResponse, lawyersResponse] = await Promise.all([
                axios.get("http://localhost:4000/api/auth/AllUsers"),
                axios.get("http://localhost:4000/api/lawyer/list")
            ]);

            // Process regular users
            const otherUsers = usersResponse.data
                .filter(user => user._id !== loggedInUserId)
                .map(user => ({
                    ...user,
                    profilePicture: user.profilePicture
                        ? `http://localhost:4000${user.profilePicture}`
                        : "/default-avatar.png",
                    isLawyer: false
                }));

            // Process lawyers
            const allLawyers = lawyersResponse.data.map(lawyer => ({
                ...lawyer,
                _id: lawyer._id, // Ensure _id exists
                profilePicture: lawyer.profilePicture
                    ? `http://localhost:4000/uploads/${lawyer.profilePicture}`
                    : "/default-avatar.png",
                name: `${lawyer.firstName} ${lawyer.lastName}`,
                isLawyer: true
            }));

            setUsers(otherUsers);
            setLawyers(allLawyers);

            // Combine users and lawyers for message processing
            const allContacts = [...otherUsers, ...allLawyers];

            // 2. Fetch conversation data for each contact
            const counts = {};
            const messages = {};
            const timestamps = {};

            await Promise.all(allContacts.map(async (contact) => {
                try {
                    // Get unseen count
                    const countResponse = await axios.get(
                        `http://localhost:4000/api/messages/unseenCount/${loggedInUserId}/${contact._id}`
                    );
                    counts[contact._id] = countResponse.data.unseenCount || 0;

                    // Get last message and its timestamp
                    const lastMsgResponse = await axios.get(
                        `http://localhost:4000/api/messages/lastMessage/${loggedInUserId}/${contact._id}`
                    );
                    const lastMsg = lastMsgResponse.data;

                    messages[contact._id] = lastMsg?.message || "No messages yet";
                    timestamps[contact._id] = lastMsg?.createdAt || new Date(0).toISOString();
                } catch (error) {
                    console.error(`Error fetching data for contact ${contact._id}:`, error);
                    counts[contact._id] = 0;
                    messages[contact._id] = "No messages yet";
                    timestamps[contact._id] = new Date(0).toISOString();
                }
            }));

            setUnseenCounts(counts);
            setLastMessages(messages);
            setLastMessageTimes(timestamps);
        } catch (error) {
            console.error("Error initializing data:", error);
        }
    }, [loggedInUserId]);

    useEffect(() => {
        fetchChatData();
    }, [fetchChatData]);

    // Filter contacts based on search term
    useEffect(() => {
        const allContacts = [...users, ...lawyers];
        const filtered = allContacts.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users, lawyers]);

    const markMessagesAsSeen = async (userId) => {
        try {
            await axios.put(
                `http://localhost:4000/api/messages/markAsSeen`,
                { 
                    userId: loggedInUserId, 
                    friendId: userId,
                    markAll: true 
                }
            );
            setUnseenCounts(prev => ({ ...prev, [userId]: 0 }));
        } catch (error) {
            console.error("Error marking messages as seen:", error);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setSelectedUserId(user._id);
        if (unseenCounts[user._id] > 0) {
            markMessagesAsSeen(user._id);
        }
    };

    // Sort contacts - unseen messages first, then by most recent
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        // First sort by whether there are unseen messages
        const hasUnseenA = unseenCounts[a._id] > 0;
        const hasUnseenB = unseenCounts[b._id] > 0;
        
        if (hasUnseenA && !hasUnseenB) return -1;
        if (!hasUnseenA && hasUnseenB) return 1;
        
        // If both have unseen or both don't, sort by message date
        const dateA = new Date(lastMessageTimes[a._id]);
        const dateB = new Date(lastMessageTimes[b._id]);
        
        // If dates are invalid, push to bottom
        if (isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) return 1;
        if (!isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return -1;
        
        // Sort by most recent first
        return dateB - dateA;
    });

    return (
        <div className="flex-1 overflow-hidden h-full flex flex-col">
            <Userinfo />

            {/* Search Bar */}
            <div className="flex items-center gap-4 p-4">
                <div className="flex items-center gap-4 bg-gray-800 bg-opacity-50 rounded-lg px-4 py-2 flex-1">
                    <img src={searchIcon} alt="Search" className="w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full"
                    />
                </div>
                <img
                    src={addMode ? minusIcon : plusIcon}
                    alt="Toggle Add Mode"
                    className="w-9 h-9 bg-gray-800 bg-opacity-50 p-2 rounded-lg cursor-pointer"
                    onClick={() => setAddMode(prev => !prev)}
                />
            </div>

            {/* User List */}
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] px-4">
                {sortedUsers.length > 0 ? (
                    sortedUsers.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleUserClick(user)}
                            className={`flex items-center gap-4 p-4 border-b border-gray-600 cursor-pointer hover:bg-gray-700 ${
                                selectedUserId === user._id ? 'bg-gray-600' : ''
                            }`}
                        >
                            <img
                                src={user.profilePicture}
                                alt="User Avatar"
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => { e.target.src = "/default-avatar.png"; }}
                            />
                            <div className="flex flex-col gap-1 flex-1">
                                <span className="font-semibold text-white flex items-center">
                                    {user.name}
                                    {user.isLawyer && (
                                        <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            Lawyer
                                        </span>
                                    )}
                                    {unseenCounts[user._id] > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            {unseenCounts[user._id]}
                                        </span>
                                    )}
                                </span>
                                <p className="text-sm text-gray-400 truncate">
                                    {lastMessages[user._id]}
                                </p>
                            </div>
                            <div className="text-xs text-gray-500">
                                {lastMessageTimes[user._id] ? 
                                    new Date(lastMessageTimes[user._id]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                                    ''}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400">No contacts found</p>
                )}
            </div>
        </div>
    );
};

Friend.propTypes = {
    setSelectedUser: PropTypes.func.isRequired,
};

export default Friend;