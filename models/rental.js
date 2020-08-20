const Joi = require('joi');
const mongoose = require('mongoose');

const Rental = mongoose.model('Rental', new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true
      },
      isGold: {
        type: Boolean,
        default: false
      },
      phone: {
        type: String,
        minlength: 5,
        maxlength: 50,
        required: true
      }
    }),
    required: true
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        minlength: 5,
        maxlength: 255,
        trim: true,
        required: true
      }
    }),
    required: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
}));

function validateRental(body) {
  return Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  }).validate(body);
}

exports.Rental = Rental;
exports.validate = validateRental;