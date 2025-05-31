import { useState, useEffect } from 'react';

const UnseenMessages = () => {
    const [unseenMessages, setUnseenMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUnseenMessages();
    }, []);

    const fetchUnseenMessages = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/contact/messages/unseen');
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            const data = await response.json();
            setUnseenMessages(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const markAsSeen = async (id) => {
        try {
            const response = await fetch(`http://localhost:4000/api/contact/messages/${id}/mark-seen`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark message as seen');
            }
            
            // Remove the message from the unseen list
            setUnseenMessages(unseenMessages.filter(message => message._id !== id));
        } catch (err) {
            console.error('Error marking message as seen:', err);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">New FeedBack</h1>
            
            {unseenMessages.length === 0 ? (
                <div className="bg-gray-100 p-4 rounded-lg">
                    No unseen messages available.
                </div>
            ) : (
                <div className="space-y-4">
                    {unseenMessages.map((message) => (
                        <div key={message._id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-semibold">{message.name}</h2>
                                <span className="text-sm text-gray-500">
                                    {new Date(message.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-3">{message.message}</p>
                            <div className="flex justify-between items-center">
                                <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                                    {message.email}
                                </a>
                                <button
                                    onClick={() => markAsSeen(message._id)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    Mark as Read
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UnseenMessages;