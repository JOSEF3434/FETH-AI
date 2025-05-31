import { useDropzone } from 'react-dropzone';
import { useState, useRef } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import PropTypes from 'prop-types';
import imgIcon from './image/img.png';
import cameraIcon from './image/camera.png';
import micIcon from './image/mic.png';
import emojiIcon from './image/emoji.png';

const ChatMessageBox = ({ text, setText, receiver, openCamera, startRecording }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiRef = useRef(null);
    const sender = JSON.parse(localStorage.getItem("user"))?._id; // Get logged-in user ID
    const [selectedFile, setSelectedFile] = useState(null);

    const onDrop = (acceptedFiles) => {
        console.log(acceptedFiles);
        setSelectedFile(acceptedFiles[0]); // Store the first uploaded file
        setText((prev) => prev + " [Image uploaded]");
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleClickOutside = (event) => {
        if (emojiRef.current && !emojiRef.current.contains(event.target)) {
            setShowEmojiPicker(false);
        }
    };

    // Function to send message to backend
    const handleSendMessage = async () => {
        if (!text.trim() && !selectedFile) return; // Prevent sending empty messages

        // Ensure sender and receiver are defined
        if (!sender || !receiver) {
            console.error("Sender or receiver is not defined.");
            return;
        }

        try {
            let imageUrl = null;

            // Upload the selected file if available
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);

                const uploadResponse = await axios.post('http://localhost:4000/api/upload', formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                imageUrl = uploadResponse.data.imageUrl; // Assuming backend returns image URL
            }

            // Send message data to backend
            const response = await axios.post('http://localhost:4000/api/messages/send', {
                sender,
                receiver,
                message: text.trim() || "", // Ensure message is trimmed
                image: imageUrl || "",
                audio: "" // Placeholder for future audio support
            });

            console.log('Message sent:', response.data);
            setText(''); // Clear input after sending
            setSelectedFile(null); // Clear selected file
        } catch (error) {
            console.error('Error sending message:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="flex items-center gap-5 p-5 border-t border-gray-300 relative" onClick={handleClickOutside}>
            <input {...getInputProps()} className="hidden" />
            <div className="flex gap-5">
                <img src={imgIcon} alt="Gallery" className="w-5 h-5 cursor-pointer" {...getRootProps()} />
                <img src={cameraIcon} alt="Camera" className="w-5 h-5 cursor-pointer" onClick={openCamera} />
                <img src={micIcon} alt="Mic" className="w-5 h-5 cursor-pointer" onClick={startRecording} />
            </div>

            <input 
                type="text" 
                placeholder="Type a message..." 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                className="flex-1 border p-2 rounded" 
            />
            
            <img src={emojiIcon} alt="Emoji" className="w-5 h-5 cursor-pointer" onClick={() => setShowEmojiPicker(true)} />
            <button className="bg-blue-500 text-white py-2 px-5 rounded-lg cursor-pointer" onClick={handleSendMessage}>
                Send
            </button>

            {showEmojiPicker && (
                <div ref={emojiRef} className="absolute bottom-14 right-5 bg-white p-2 rounded shadow-lg">
                    <EmojiPicker onEmojiClick={(emoji) => setText(text + emoji.emoji)} />
                </div>
            )}
        </div>
    );
};

ChatMessageBox.propTypes = {
    text: PropTypes.string.isRequired,
    setText: PropTypes.func.isRequired,
    receiver: PropTypes.string.isRequired,
    openCamera: PropTypes.func.isRequired,
    startRecording: PropTypes.func.isRequired
};

export default ChatMessageBox;
