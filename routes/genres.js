const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');
const Joi = require('joi');
const { Genre }  = require('../models/genre');
const express = require('express');
const router = express.Router();

// Get Genres
router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.send(genres);
});

// Get Genre
router.get('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre
    .findOne({
      _id: req.params.id
    });
  if (!genre) {
    return res.status(404).send('Requested id was not found');
  }
  res.send(genre);
});

// Add Genre
router.post('/', [auth, validate(validateGenre)], async (req, res) => {
  const genre = new Genre({
    name: req.body.name
  });

  try {
    const saveResult = await genre.save();
    res.send(saveResult);
  }
  catch (err) {
    for (field in err.errors) {
      console.log(err.errors[field].message);
    }
  }
});

// Update Genre
router.put('/:id', [auth, validateObjectId, validate(validateGenre)], async (req, res) => {
  const genre = await Genre.findOne({ _id: req.params.id });
  if (!genre) {
    return res.status(404).send('Requested id was not found');
  }

  const updateResult = await Genre.findOneAndUpdate({ _id: req.params.id }, {
    $set: {
      name: req.body.name
    }
  }, { new: true });
  res.send(updateResult);
});

// Delete Video
router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const result = await Genre.findOneAndRemove({ _id: req.params.id });
  if (!result) {
    return res.status(404).send('Requested id was not found');
  }
  res.send(result);
});

function validateGenre(body) {
  return Joi.object({
    name: Joi.string().min(5).max(255).required()
  })
  .validate(body);
}

module.exports = router;