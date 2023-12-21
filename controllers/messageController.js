const Message = require('../models/Message');
const axios = require('axios');

// Validation
const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    message: Joi.string().required(),
});

module.exports.createMessage = async (req, res) => {

    try {

        // Validate data before save
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).send({ error: error.details[0].message });
        }
        // Create a new message
        const newMessage = new Message(value);
        await newMessage.save();
    
        return res.status(201).json({ message: 'Message created successfully.', message: newMessage });
    } catch (error) {
        console.error('Error creating message:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }

}

// Delete message based on their id
module.exports.deleteMessage = async (req, res) => {
    const messageId = req.params.id;

    try {
        // Find the message by ID
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Delete the message from the database
        await Message.findByIdAndDelete(messageId);

        return res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all data
module.exports.allMessages = async (req, res) => {

    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

//=========================================================================
//=========================================================================

module.exports.postDeleteMessage = async (req, res) => {
    const messageId = req.params.id;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            req.flash('error', 'Message not found');
            return res.redirect(`/messages`);
        }

        // Delete the message from the database
        await Message.findByIdAndDelete(messageId);

        req.flash('success', 'Message deleted successfully');
        res.redirect('/messages');
    } catch (error) {
        console.error('Error deleting message:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect(`/messages`);
    }
};

module.exports.getViewMessage = async (req, res) => {
    let id = req.params.id;
  
    try {

      const message = await Message.findById(id);
  
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      return res.render('messages/view',{ message: message });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}