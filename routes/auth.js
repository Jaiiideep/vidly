const Joi = require('joi');
const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');

router.get('/', async (req, res) => {
  const result = await User.find().sort('name');
  res.send(result);
});

router.get('/:id', async (req, res) => {
  const result = await User.find({ _id: req.params.id });
  res.send(result);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) return res.status(400).send('Invalid email or password');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password');

  const token = user.generateAuthToken();
  res.send(token);
});

router.put('/:id', async (req, res) => {
  const result = await User.updateOne({ _id: req.params.id }, {
    $set: {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    }
  });
  res.send(result);
});

router.delete('/:id', async (req, res) => {
  const result = await User.remove({ _id: req.params.id });
  res.send(result);
});

function validate(req) {
    return Joi.object({
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(255).required()
    }).validate(req);
}

module.exports = router;