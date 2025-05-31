const express = require('express');
const router = express.Router();
const Contact = require('../models/Contacts');

// POST route for creating a contact message
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const contact = new Contact({ name, email, message });
        await contact.save();
        res.status(201).json({ message: 'Message saved successfully' });
    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// GET route for fetching unseen contact messages
router.get('/messages/unseen', async (req, res) => {
    try {
        const messages = await Contact.find({ seen: false }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// GET route for fetching seen contact messages
router.get('/messages/seen', async (req, res) => {
    try {
        const messages = await Contact.find({ seen: true }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Updated route in your backend (contacts.js or similar)
router.get('/messages/unseen/count', async (req, res) => {
    try {
        const count = await Contact.countDocuments({ seen: false });
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error counting unseen messages:', error);
        res.status(500).json({ error: 'Failed to count messages' });
    }
});

// PUT route to mark message as seen
router.put('/messages/:id/mark-seen', async (req, res) => {
    try {
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { seen: true },
            { new: true }
        );
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.status(200).json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});

module.exports = router;
