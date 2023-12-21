const mongoose = require('mongoose');

const partnerMessageSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  }, {
    timestamps: true,
});

const PartnerMessage = mongoose.model('partnerMessage', partnerMessageSchema);

module.exports = PartnerMessage;