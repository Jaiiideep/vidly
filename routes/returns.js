const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const moment = require('moment');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
  let rental = await Rental.findOne({
    'customer._id': req.body.customerId,
    'movie._id': req.body.movieId
  });

  if (!rental) return res.status(404).send('Rental not found');

  if (rental.dateReturned) return res.status(400).send('Rental already processed');

  rental.dateReturned = new Date();
  const rentalDays = moment().diff(rental.dateOut, 'days');
  if (rentalDays == 0) {
    rental.rentalFee = rental.movie.dailyRentalRate;
  }
  else {
    rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;
  }
  await rental.save();

  await Movie.update({ _id: rental.movie._id }, {
    $inc: { numberInStock: 1 }
  });

  res.status(200).send(rental);
});

function validateReturn(req) {
  return Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  })
  .validate(req);
}

module.exports = router;