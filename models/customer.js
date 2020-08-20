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

// Joi Model
function validateCustomer(body) {
  return Joi.object({
      name: Joi.string().min(3).required(),
      phone: Joi.string().required(),
      isGold: Joi.boolean()
    })
    .validate(body)
  ;
}

exports.Customer = Customer;
exports.validate = validateCustomer;