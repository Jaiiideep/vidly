const Joi = require('joi');
const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { User } = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');

router.post('/', validate(validateLogin), async (req, res) => {
  let user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) return res.status(400).send('Invalid email or password');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password');

  const token = user.generateAuthToken();
  res.send(token);
});

function validateLogin(req) {
  return Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  }).validate(req);
}

module.exports = router;