const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const Joi = require('joi');

Fawn.init(mongoose);

router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.get('/:id', async (req, res) => {
  const result = await Rental.findOne({ _id: req.params.id });
  res.send(result);
});

router.post('/', validate(validateRental), async (req, res) => {
  const customer = await Customer.findById({ _id: req.body.customerId });
  if (!customer) return res.status(404).send('Invalid Customer');

  const movie = await Movie.findOne({ _id: req.body.movieId });
  if (!movie) return res.status(404).send('Invalid Movie');

  if (movie.numberInStock == 0) {
    return res.status(400).send('Movie is not in stock');
  }

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });
  try {
    new Fawn.Task()
      .save('rentals', rental)
      .update('movies', { _id: movie._id }, {
        $inc: { numberInStock: -1 }
      })
      .run();
    res.send(rental);
  }
  catch (err) {
    return res.status(500).send('Something Failed');
  }
});

function validateRental(body) {
  return Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  }).validate(body);
}

module.exports = router;