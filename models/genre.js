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

const Genre = mongoose.model('Genre', genreSchema);

exports.genreSchema = genreSchema;
exports.Genre = Genre;