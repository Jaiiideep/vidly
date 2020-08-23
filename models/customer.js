const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Model
const Customer = mongoose.model('Customer',
  new mongoose.Schema({
    name: {
      type: String,
      minlength: 3,
      required: true
    },
    isGold: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String,
      required: true
    }
  })
);

module.exports = Customer;