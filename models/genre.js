const Joi = require('joi');
const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 255,
    trim: true,
    required: true
  }
});

// Mongoose Model
const Genre = mongoose.model('Genre', genreSchema);

// Joi Model
function validateGenre(body) {
  return Joi.object({
    name: Joi.string().min(5).max(255).required()
  })
  .validate(body);
}

exports.Genre = Genre;
exports.validate = validateGenre;
exports.genreSchema = genreSchema;