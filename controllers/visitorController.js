const Visitor = require('../models/Visitor');
const axios = require('axios');

// Validation
const Joi = require('joi');

const schema = Joi.object({
    ipAddress: Joi.string().ip().required(),
    // visitCount: Joi.number().integer().min(1),
    lastVisit: Joi.date(),
    country: Joi.string(),
    referrer: Joi.string().uri().empty('').default('unknown'),
    userAgent: Joi.string(),
    currentUrl: Joi.string().uri(),
})

const getCountryFromIP = async (ipAddress) => {
    try {
      const response = await axios.get(`http://ip-api.com/json/${ipAddress}`);
  
      if (response.data && response.data.country) {
        return response.data.country;
      } else {
        console.error('Failed to fetch country from IP:', response.data);
        return null;
      }
    } catch (error) {
      console.error('Error fetching country from IP:', error);
      return null;
    }
};

module.exports.createVisitor = async (req, res) => {

    // Validate data before save
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    const { ipAddress, referrer, userAgent, currentUrl } = req.body;

    try {
        // const existingVisitor = await Visitor.findOne({ ipAddress });

        // if (existingVisitor) {
        //     // If the visitor exists, increment the visitCount
        //     existingVisitor.visitCount += 1;
        //     existingVisitor.lastVisitedAt = new Date();
        //     await existingVisitor.save();
        //     return res.status(200).json({ message: 'Visitor count updated successfully.', visitor: existingVisitor });
        // }

        // If the visitor does not exist, create a new visitor
        // If the visitor does not exist, fetch country based on IP address
        const country = await getCountryFromIP(ipAddress);

        const newVisitor = new Visitor();
        newVisitor.ipAddress = ipAddress;
        newVisitor.userAgent = userAgent;
        newVisitor.lastVisitedAt = new Date();
        newVisitor.currentUrl = currentUrl;
        newVisitor.country = country;
        newVisitor.referrer = referrer;

        await newVisitor.save();

        return res.status(201).json({ message: 'New visitor created successfully.', visitor: newVisitor });
    } catch (error) {
        console.error('Error creating or updating visitor:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }

}

// Get all data
module.exports.allVisitors = async (req, res) => {

    try {
        const visitors = await Visitor.find();
        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}