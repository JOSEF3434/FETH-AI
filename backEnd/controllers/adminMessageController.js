const AdminMessage = require('../models/AdminMessage');

// Add a new message
exports.addMessage = async (req, res) => {
    const { name, email, reason } = req.body;

    try {
        if (!name || !email || !reason) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newMessage = new AdminMessage({ name, email, reason });
        await newMessage.save();
        res.status(201).json({ message: 'Message added successfully' });
    } catch (error) {
        console.error('Error adding message:', error.message);
        res.status(500).json({ error: 'Server error while adding message' });
    }
};

// Get all messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await AdminMessage.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        res.status(500).json({ error: 'Server error while fetching messages' });
    }
};
 
// Update message (mark as read)
exports.updateMessage = async (req, res) => {
    const { id } = req.params;
    const { isSeen } = req.body;

    try {
        const updatedMessage = await AdminMessage.findByIdAndUpdate(
            id,
            { isSeen },
            { new: true }
        );
        
        if (!updatedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        res.status(200).json(updatedMessage);
    } catch (error) {
        console.error('Error updating message:', error.message);
        res.status(500).json({ error: 'Server error while updating message' });
    }
};