const express = require('express');
const { Genre } = require('../models/genre');
const router = express.Router();
const { Movie, validate } = require('../models/movie');

router.get('/', async (req, res) => {
  const result = await Movie.find().sort('name');
  res.send(result);
});

router.get('/:id', async (req, res) => {
  const result = await Movie.find({ _id: id });
  if (result.length === 0) {
    return res.status(400).send('Requested id was not found');
  }
  res.send(result);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
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

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const result = await Movie.updateOne({ _id: req.params.id }, {
    $set: {
      title: req.body.title,
      genre: req.body.genre,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    }
  });
  res.send(result);
});

router.delete('/:id', async (req, res) => {
  const result = Movie.remove({ _id: req.params.id });
  res.send(result);
})

module.exports = router;