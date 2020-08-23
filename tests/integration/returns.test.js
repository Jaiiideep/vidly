const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const moment = require('moment');
const mongoose = require('mongoose');
const request = require('supertest');
const { Movie } = require('../../models/movie');

describe('/api/returns', () => {
  let server;
  let customerId;
  let movieId;
  let rental;
  let payload;
  let token;
  let movie;

  beforeEach(async () => {
    server = require('../../index');

    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();

    payload = { customerId, movieId };
    token = (new User()).generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: '12345',
      genre: { name: '12345' },
      numberInStock: 1,
      dailyRentalRate: 2
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: '12345',
        phone: '12345'
      },
      movie: {
        _id: movieId,
        title: '12345',
        dailyRentalRate: 2
      }
    });

    await rental.save();
  });

  afterEach(async () => {
    await Rental.remove({});
    await Movie.remove({});
    await server.close();
  });

  const exec = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send(payload);
  };

  it('should return 401 if client is not logged in', async () => {
    token = '';
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it('should return 400 if customer id is not provided', async () => {
    payload = { movieId };
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 400 if movie id is not provided', async () => {
    payload = { customerId };
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental found for this customer/movie', async () => {
    await Rental.remove({});
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it('should return 400 if rental is already processed', async () => {
    rental.dateReturned = new Date();
    await rental.save();
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 200 if we have a valid request', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it('should set the returnDate if input is valid', async () => {
    const res = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should calculate the rental fee', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate();
    await rental.save();

    const res = await exec();

    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(14);
  });

  it('should calculate the rental fee for same day return', async () => {
    const res = await exec();

    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(2);
  });

  it('should increase the stock of the movie', async () => {
    const res = await exec();

    const movieInDb = await Movie.findById(movieId);
    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it('should return the rental', async () => {
    const res = await exec();

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(
        ['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie']
      ));
  });
});