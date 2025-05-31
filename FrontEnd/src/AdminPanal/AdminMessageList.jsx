import { useState, useEffect } from 'react';
import axios from 'axios';
import SideBar from './SideBar';

const AdminMessageList = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/messages');
        setMessages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load messages');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchMessages();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:4000/api/messages/${id}`, { isSeen: true });
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, isSeen: true } : msg
      ));
    } catch (err) {
      console.error('Failed to update message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4">
      <SideBar />
      <div className="flex mt-6 flex-col col-span-3 items-center p-6 bg-gray-100 min-h-screen">
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Messages</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">New Messages</h2>
        {messages.filter(msg => !msg.isSeen).length === 0 ? (
          <p className="text-gray-500">No new messages</p>
        ) : (
          <div className="space-y-4">
            {messages.filter(msg => !msg.isSeen).map(message => (
              <div key={message._id} className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800">{message.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                    <p className="text-gray-700">{message.reason}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => markAsRead(message._id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  >
                    Mark as Read
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Message History</h2>
        {messages.filter(msg => msg.isSeen).length === 0 ? (
          <p className="text-gray-500">No message history</p>
        ) : (
          <div className="space-y-4">
            {messages.filter(msg => msg.isSeen).map(message => (
              <div key={message._id} className="p-4 border border-gray-200 bg-gray-50 rounded-lg shadow-sm">
                <div>
                  <h3 className="font-bold text-gray-800">{message.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{message.email}</p>
                  <p className="text-gray-700">{message.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div></div></div>
  );
};

export default AdminMessageList;