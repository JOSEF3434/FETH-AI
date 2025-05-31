import { useState, useEffect } from 'react';

const SeenMessages = () => {
    const [unseenMessages, setUnseenMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUnseenMessages();
    }, []);

    const fetchUnseenMessages = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/contact/messages/seen');
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

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Unseen Messages</h1>
            
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SeenMessages;