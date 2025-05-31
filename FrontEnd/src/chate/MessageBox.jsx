import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import PropTypes from "prop-types";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import imgIcon from "./image/img.png";
import micIcon from "./image/mic.png";
import emojiIcon from "./image/emoji.png";
import ChatMessageTop from "./ChatMessageTop";

const MessageBox = ({ selectedUser, currentUser }) => {
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [recording, setRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const fileInputRef = useRef(null);
    const emojiRef = useRef(null);
    const [recordTime, setRecordTime] = useState(0);
    const recordInterval = useRef(null);
    const mediaRecorderRef = useRef(null);
    const socket = useRef(null);

    const sender = JSON.parse(localStorage.getItem("user"))?._id;
    currentUser = currentUser || JSON.parse(localStorage.getItem("user"));

    // Add this helper function at the top of your component
const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const icons = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📑',
    pptx: '📑',
    zip: '🗄️',
    rar: '🗄️',
    default: '📁'
  };
  return icons[extension] || icons.default;
};
    useEffect(() => {
        if (!selectedUser || !sender) return;
        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:4000/api/messages/${sender}/${selectedUser._id}`
                );
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchMessages();
    }, [selectedUser, sender]);

    useEffect(() => {
        if (!selectedUser) return;
        socket.current = io("http://localhost:4000");
        socket.current.on("newMessage", (newMsg) => {
            if (
                newMsg.sender === selectedUser._id ||
                newMsg.receiver === selectedUser._id
            ) {
                setMessages((prev) => [...prev, newMsg]);
            }
        });
        return () => socket.current.disconnect();
    }, [selectedUser]);

    const sendMessage = async () => {
        if (!text && !selectedFile && !audioBlob) return;
        setLoading(true);
        let fileUrl = "";
        let messageType = "text";

        if (selectedFile) {
            const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

            if (["png", "jpg", "jpeg", "gif"].includes(fileExtension)) {
                messageType = "image";
            } else if (["mp4", "mov", "avi"].includes(fileExtension)) {
                messageType = "video";
            } else if (["mp3", "wav"].includes(fileExtension)) {
                messageType = "audio";
            } else if (
                ["pdf", "doc", "docx", "ppt", "pptx"].includes(fileExtension)
            ) {
                messageType = "file";
            }

            const formData = new FormData();
            formData.append("file", selectedFile);

            try {
                const response = await axios.post(
                    `http://localhost:4000/api/upload`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                fileUrl = response.data.fileUrl;
            } catch (error) {
                console.error("Error uploading file:", error);
                alert("File upload failed");
                setLoading(false);
                return;
            }
        }

        if (audioBlob) {
            messageType = "audio";
            const formData = new FormData();
            formData.append("file", audioBlob, "recording.mp3");

            try {
                const response = await axios.post(
                    `http://localhost:4000/api/upload`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                fileUrl = response.data.fileUrl;
            } catch (error) {
                console.error("Error uploading audio:", error);
                alert("Audio upload failed");
                setLoading(false);
                return;
            }
        }

        try {
            const messageData = {
                sender: currentUser._id,
                receiver: selectedUser._id,
                message: text,
                messageType,
                fileUrl,
            };

            await axios.post(
                `http://localhost:4000/api/messages/${sender}/${selectedUser._id}`,
                messageData
            );
            socket.current.emit("sendMessage", messageData);
            setMessages((prev) => [...prev, messageData]);
            setText("");
            setSelectedFile(null);
            setAudioBlob(null);
            setLoading(false);
        } catch (error) {
            console.error("Message sending failed:", error);
            alert("Message sending failed");
            setLoading(false);
        }
    };

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorderRef.current.ondataavailable = (event) =>
            audioChunks.push(event.data);
        mediaRecorderRef.current.onstop = () => {
            const audioFile = new Blob(audioChunks, { type: "audio/mp3" });
            setAudioBlob(audioFile);
            setText("recording.mp3");
        };

        mediaRecorderRef.current.start();
        setRecording(true);
        setRecordTime(0);

        recordInterval.current = setInterval(() => {
            setRecordTime((prev) => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        clearInterval(recordInterval.current);
        setRecording(false);
    };

    const cancelRecording = () => {
        setRecording(false);
        setAudioBlob(null);
        setRecordTime(0);
    };

    const handleClickOutside = (event) => {
        if (emojiRef.current && !emojiRef.current.contains(event.target)) {
            setShowEmojiPicker(false);
        }
    };

    return (
        <div
            className="flex flex-col h-full border-l border-r border-gray-300"
            onClick={handleClickOutside}
        >
            <ChatMessageTop selectedUser={selectedUser} />
           <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hidden">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`flex items-center gap-2 ${
        msg.sender === currentUser?._id ? "justify-end" : "justify-start"
      }`}
    >
      {msg.sender !== currentUser?._id && selectedUser?.profilePicture && (
        <img
          src={selectedUser.profilePicture}
          alt="Profile"
          className="w-8 h-8 rounded-full"
        />
      )}
      <div
        className={`p-3 max-w-xs break-words rounded-lg shadow-md ${
          msg.sender === currentUser?._id
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        {msg.messageType === "text" && <p>{msg.message}</p>}
        {msg.messageType === "image" && (
          <img
            src={msg.fileUrl}
            alt="Sent"
            className="w-64 h-64 rounded-lg object-cover"
          />
        )}
        {msg.messageType === "video" && (
          <video controls src={msg.fileUrl} className="w-64 rounded-lg" />
        )}
        {msg.messageType === "audio" && (
          <audio controls src={msg.fileUrl} />
        )}
        {msg.messageType === "file" && (
          <div className="flex flex-col space-y-2">
            <span className="font-semibold">
              {msg.fileUrl.split('/').pop().split('?')[0]}
            </span>
            <div className="flex space-x-4">
              <button 
                onClick={() => window.open(msg.fileUrl, '_blank')}
                className="text-blue-500 hover:underline"
              >
                Preview
              </button>{/*
              <a 
                href={`http://localhost:4000/api/download/${msg.fileUrl.split('/').pop()}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Download
              </a>*/}
            </div>
          </div>
        )}
      </div>
    </div>
  ))}
</div>
            <div className="flex items-center gap-3 p-4 border-t">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <img
                    src={imgIcon}
                    alt="Gallery"
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                />
                <img
                    src={micIcon}
                    alt="Mic"
                    className="w-6 h-6 cursor-pointer"
                    onClick={startRecording}
                />
                {recording && (
                    <div className="flex items-center gap-2">
                        <span className="text-red-500">{recordTime}s</span>
                        <button
                            onClick={stopRecording}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                            🛑
                        </button>
                        <button
                            onClick={cancelRecording}
                            className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                            ❌
                        </button>
                    </div>
                )}
                <input
                    type="text"
                    placeholder="Type something..."
                    value={selectedFile ? selectedFile.name : text} // Show file name if a file is selected, otherwise show text
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 p-2 border rounded"
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            setSelectedFile(file);
                        }
                    }}
                />
                <img
                    src={emojiIcon}
                    alt="Emoji"
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />
                <button
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                    disabled={loading}
                    onClick={sendMessage}
                >
                    {loading ? "Sending..." : "Send"}
                </button>
                {showEmojiPicker && (
                    <div
                        ref={emojiRef}
                        className="absolute bottom-14 md:right-66 bg-white p-2 max-sm:ml-15 rounded shadow-lg"
                    >
                        <EmojiPicker
                            onEmojiClick={(emoji) => {setText(text + emoji.emoji);
                            setShowEmojiPicker(false);}}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

MessageBox.propTypes = {
    selectedUser: PropTypes.object,
    currentUser: PropTypes.object,
};
export default MessageBox;
