const PartnerMessage = require('../models/PartnerMessage');

// Validation
const Joi = require('joi');

const schema = Joi.object({
    name: Joi.string().required().min(2),
    companyName: Joi.string().required().min(2),
    email: Joi.string().email().required(),
    phone: Joi.string().required(), // Adjust the validation according to your phone number format
    message: Joi.string().required().min(2),
});

module.exports.createPartnerMessage = async (req, res) => {

    // Validate data before save
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    try {
        // Assuming the form data is sent in the request body
        const { name, companyName, email, phone, message } = req.body;

        // Create a new FormData document
        const partnerMessage = new PartnerMessage({
            name,
            companyName,
            email,
            phone,
            message,
        });

        // Save the document to the database
        await partnerMessage.save();

        res.status(201).json({ message: 'Message saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

// ========================= DASHBOARD ==============================
// ========================= DASHBOARD ==============================

module.exports.getViewPartnerMessage = async (req, res) => {
    let id = req.params.id;
  
    try {

      const partnerMessage = await PartnerMessage.findById(id);
  
      if (!partnerMessage) {
        return res.status(404).json({ message: 'Partner Message not found' });
      }
  
      return res.render('partnermessages/view',{ partnerMessage: partnerMessage });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}

module.exports.postDeletePartnerMessage = async (req, res) => {
    const partnerMessageId = req.params.id;

    try {
        const partnermessage = await PartnerMessage.findById(partnerMessageId);

        if (!partnermessage) {
            req.flash('error', 'Partner message not found');
            return res.redirect(`/partner-messages`);
        }

        // Delete the feedback from the database
        await PartnerMessage.findByIdAndDelete(partnerMessageId);

        req.flash('success', 'Partner message deleted successfully');
        res.redirect('/partner-messages');
    } catch (error) {
        console.error('Error deleting feedback:', error);
        req.flash('error', 'Internal Server Error');
        res.redirect(`/partner-messages`);
    }
};