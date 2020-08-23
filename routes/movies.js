const express = require('express');
const Joi = require('joi');
const { Genre } = require('../models/genre');
const router = express.Router();
const { Movie } = require('../models/movie');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');

router.get('/', async (req, res) => {
  const result = await Movie.find().sort('title');
  res.send(result);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const result = await Movie.findOne({ _id: req.params.id });
  if (!result) {
    return res.status(404).send('Requested id was not found');
  }
  res.send(result);
});

router.post('/', validate(validateMovie), async (req, res) => {
  const genre = await Genre.findOne({ _id: req.body.genreId });
  if (!genre) {
    return res.status(400).send('Invalid Genre');
  }

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate:req.body.dailyRentalRate
  });
  try {
    const result = await movie.save();
    res.send(result);
  }
  catch (err) {
    return res.status(400).send('Bad Request');
  }
});

router.put('/:id', validate(validateMovie), async (req, res) => {
  const genre = await Genre.findOne({ _id: req.body.genreId });
  if(!genre) return res.status(400).send('Invalid Genre');

  const result = await Movie.findOneAndUpdate({ _id: req.params.id }, {
    $set: {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    }
  }, { new: true });
  res.send(result);
});

router.delete('/:id', validateObjectId, async (req, res) => {
  const result = await Movie.findOneAndDelete({ _id: req.params.id });
  if (!result) {
    return res.status(404).send('Movie with the requested id was not found');
  }
  res.send(result);
});

function validateMovie(body) {
  return Joi.object({
      title: Joi.string().min(5).required(),
      genreId: Joi.objectId().required(),
      numberInStock: Joi.number().min(0).max(255).required(),
      dailyRentalRate: Joi.number().min(0).max(255).required()
    })
    .validate(body);
}

module.exports = router;