
import axios from "axios";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import ChatMessageBox from './ChatMessageBox';
import ChatMessageTop from './ChatMessageTop';
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const MessageBox = ({ selectedUser, currentUser }) => {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([]);
    const socket = useRef(null);

    // Ensure currentUser is obtained from localStorage if not passed as a prop
    const storedUser = JSON.parse(localStorage.getItem("user"));
    currentUser = currentUser || storedUser;

    useEffect(() => {
        if (!selectedUser || !currentUser) {
            console.log("No selected user or current user found!");
            return;
        }

        const fetchMessages = async () => {
            try {
                //console.log("Fetching messages for:", currentUser._id, selectedUser._id);
                const response = await axios.get(
                    `http://localhost:4000/api/messages/${currentUser._id}/${selectedUser._id}`
                );
                
                if (!response.data || !Array.isArray(response.data)) {
                    console.error("Invalid message data:", response.data);
                    return;
                }
        
                //console.log("Messages received:", response.data);
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        

        fetchMessages();
    }, [selectedUser, currentUser]);

    useEffect(() => {
        if (!selectedUser) {
            console.log("No selected user available");
            return;
        }

        socket.current = io("http://localhost:4000");

        socket.current.on("newMessage", (newMsg) => {
            console.log("New message received:", newMsg);
            if (newMsg.sender === selectedUser._id || newMsg.receiver === selectedUser._id) {
                setMessages((prev) => [...prev, newMsg]);
            }
        });

        return () => {
            socket.current.disconnect();
        };
    }, [selectedUser]);

    const sendMessage = async (message, image = null, audio = null) => {
        if (!message.trim() && !image && !audio) return;

        const msgData = {
            sender: currentUser._id,
            receiver: selectedUser._id,
            message,
            image,
            audio,
            messageType: image ? "image" : audio ? "audio" : "text"
        };

        try {
            const response = await axios.post("http://localhost:4000/api/messages/send", msgData);
            socket.current.emit("sendMessage", response.data);
            setMessages((prev) => [...prev, response.data]);
            setText("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex flex-col col-span-2 flex-2 border-l border-r border-gray-300 h-full relative">
            <ChatMessageTop selectedUser={selectedUser} />
            <div className="flex-1 overflow-auto p-5 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === currentUser._id ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 max-w-xs break-words rounded-lg shadow-md 
                            ${msg.sender === currentUser._id ? "bg-blue-400 text-white" : "bg-gray-300 text-black"}`}>

                            {msg.messageType === "text" && <p>{msg.message}</p>}
                           <Link to = {msg.image} >
                            {msg.messageType === "image" && (
                                <img src={msg.image} alt="Sent Image" className="w-64 h-64 rounded-lg object-cover" />
                            )}</Link>
                            {msg.messageType === "audio" && (
                                <audio controls className="w-full">
                                    <source src={msg.audio} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <ChatMessageBox text={text} setText={setText} sendMessage={sendMessage} />
        </div>
    );
};

MessageBox.propTypes = {
    selectedUser: PropTypes.object,
    currentUser: PropTypes.object
};

export default MessageBox;
