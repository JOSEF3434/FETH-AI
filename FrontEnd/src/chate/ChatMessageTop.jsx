import PropTypes from "prop-types";
import phoneIcon from './image/phone.png';
import videoIcon from './image/video.png';
import infoIcon from './image/info.png';
import { Link } from "react-router-dom";

const ChatMessageTop = ({ selectedUser }) => {
    return (
        <div className="flex items-center justify-between p-5 border-b border-gray-300">
            <div className="flex items-center md:ml-0 ml-9 gap-5">
                <img src={selectedUser?.profilePicture} alt="User" className="w-15 h-15 rounded-full object-cover" />
                <div className="flex flex-col gap-1">
                    <span className="text-lg font-semibold">{selectedUser?.name || "Select a user"}</span>
                    <p className="text-sm text-gray-500">Chat with this user...</p>
                </div>
            </div>
            <div className="flex gap-5">
                <img src={phoneIcon} alt="Phone" className="w-5 h-5" />
                <Link 
                  to={`/VideoCall${selectedUser ? `?receiverId=${selectedUser.id}` : ''}`}
                  className={`px-3 py-2 rounded-md text-xl font-medium`}
                >
                  <img src={videoIcon} alt="Video" className="w-5 h-5" />
                </Link>
                <img src={infoIcon} alt="Info" className="w-5 h-5" />
            </div>
        </div>
    );
};

ChatMessageTop.propTypes = {
    selectedUser: PropTypes.object,
};

export default ChatMessageTop;