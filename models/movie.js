const mongoose = require('mongoose');
const { genreSchema } = require('./genre');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  genre: {
    type: genreSchema,
    required: true
  },
  numberInStock: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  }
});

const Movie = mongoose.model('Movie', movieSchema);

exports.Movie = Movie;