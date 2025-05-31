//"./src/chate/Detail.jsx"

import  { useState } from 'react';
import avatar from './image/avatar.png';
import downArrow from './image/arrowDown.png';
import arrowUp from './image/arrowUp.png';
import download from './image/download.png';
import favicon from './image/favicon.png';

const Detail = () => {
  const [isChatSettingOpen, setChatSettingOpen] = useState(false);
  const [isPrivateHelpOpen, setPrivateHelpOpen] = useState(false);
  const [isSharedPhotoOpen, setSharedPhotoOpen] = useState(false);
  const [isSharedFileOpen, setSharedFileOpen] = useState(false);

  return (
    <div className="flex flex-col justify-center p-4 space-y-4 h-screen overflow-y-auto">
      <div className="flex flex-col items-center border-b border-gray-300 pb-4">
        <img 
          src={avatar} 
          alt="User Avatar" 
          className="w-28 h-28 rounded-full object-cover mt-4" 
        />
        <h2 className="text-white text-lg font-semibold mt-2 ">User-1</h2>
      </div>

      {/* Chat Setting */}
      <div className="flex justify-between items-center cursor-pointer" 
           onClick={() => setChatSettingOpen(!isChatSettingOpen)}>
        <h2 className="text-white text-lg font-semibold">Chat Setting</h2>
        <img 
          src={isChatSettingOpen ? arrowUp : downArrow} 
          alt="Toggle Arrow" 
          className="w-4 h-4" 
        />
      </div>
      {isChatSettingOpen && (
        <div className="text-white text-sm pl-4">
          <p>Change chat background</p>
          <p>Mute notifications</p>
          <p>Archive chat</p>
        </div>
      )}

      {/* Private & Help */}
      <div className="flex justify-between items-center cursor-pointer" 
           onClick={() => setPrivateHelpOpen(!isPrivateHelpOpen)}>
        <h2 className="text-white text-lg font-semibold">Private & Help</h2>
        <img 
          src={isPrivateHelpOpen ? arrowUp : downArrow} 
          alt="Toggle Arrow" 
          className="w-4 h-4" 
        />
      </div>
      {isPrivateHelpOpen && (
        <div className="text-white text-sm pl-4">
          <p>Privacy settings</p>
          <p>Help center</p>
          <p>Contact support</p>
        </div>
      )}

      {/* Shared Photo */}
      <div className="flex justify-between items-center cursor-pointer" 
           onClick={() => setSharedPhotoOpen(!isSharedPhotoOpen)}>
        <h2 className="text-white text-lg font-semibold">Shared Photo</h2>
        <img 
          src={isSharedPhotoOpen ? arrowUp : downArrow} 
          alt="Toggle Arrow" 
          className="w-4 h-4" 
        />
      </div>
      {isSharedPhotoOpen && (
        <div className="text-white text-sm pl-4">
          <p>View all photos</p>
          <p>Download selected</p>
          <div className="flex space-x-2">
            <img src={favicon} alt="Favicon" className="w-4 h-4" />
            <h2 className="text-white text-sm">Favorite</h2>
            <img src={download} alt="Download" className="w-4 h-4 ml-auto" />
          </div>
        </div>
      )}

      {/* Shared File */}
      <div className="flex justify-between items-center cursor-pointer" 
           onClick={() => setSharedFileOpen(!isSharedFileOpen)}>
        <h2 className="text-white text-lg font-semibold">Shared File</h2>
        <img 
          src={isSharedFileOpen ? arrowUp : downArrow} 
          alt="Toggle Arrow" 
          className="w-4 h-4" 
        />
      </div>
      {isSharedFileOpen && (
        <div className="text-white text-sm pl-4">
          <p>Document.pdf</p>
          <p>Report.docx</p>
          <p>Spreadsheet.xlsx</p>
        </div>
      )}
    </div>
  )
}

export default Detail;
