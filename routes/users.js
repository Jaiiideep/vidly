const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');

router.get('/me', auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }).select('-password');
  res.send(user);
});

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

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered');

  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
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

module.exports = router;