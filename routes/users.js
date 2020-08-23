const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');

router.get('/me', auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }).select('-password');
  res.send(user);
});

router.post('/', validate(validateUser),async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered');

  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

function validateUser(body) {
  return Joi.object({
    name: Joi.string().lowercase().min(5).max(255).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  }).validate(body);
}

module.exports = router;