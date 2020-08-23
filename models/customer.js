const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Model
const Customer = mongoose.model('Customer',
  new mongoose.Schema({
    name: {
      type: String,
      minlength: 5,
      required: true
    },
    phone: {
      type: String,
      minlength: 5,
      required: true
    },
    isGold: {
      type: Boolean,
      default: false
    }
  })
);

module.exports = Customer;