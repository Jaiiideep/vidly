const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 255,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    minlength: 5,
    max: 255,
    unique: true,
    required: true
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
  return token;
};
const User = mongoose.model('User', userSchema);

exports.User = User;