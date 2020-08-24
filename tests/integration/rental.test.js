const request = require('supertest');
const mongoose = require('mongoose');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');
const { Customer } = require('../../models/customer');

let server;
describe('/api/rentals', () => {
  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    await Customer.remove({});
    await User.remove({});
    await Movie.remove({});
    await Rental.remove({});
    await server.close();
  });

  describe('GET /', () => {
    it('should return all rentals', async () => {
      await Rental.insertMany([
        {
          customer: {
            name: 'TestCustomer1',
            phone: 12345,
            isGold: true
          },
          movie: {
            title: 'TestMovie1',
            dailyRentalRate: 2
          }
        },
        {
          customer: {
            name: 'TestCustomer2',
            phone: 12345,
            isGold: true
          },
          movie: {
            title: 'TestMovie2',
            dailyRentalRate: 4
          }
        }
      ]);

      const res = await request(server)
        .get('/api/rentals');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(r => r.customer.name === 'TestCustomer1')).toBeTruthy();
      expect(res.body.some(r => r.customer.name === 'TestCustomer2')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return the rental with the given id', async () => {
      let rentalId = mongoose.Types.ObjectId();
      const rental = new Rental({
        _id: rentalId,
        customer: {
          _id: mongoose.Types.ObjectId(),
          name: 'TestCustomer',
          phone: 12345,
          isGold: true
        },
        movie: {
          _id: mongoose.Types.ObjectId(),
          title: 'TestMovie',
          dailyRentalRate: 2
        }
      });
      await rental.save();
      rentalId = rentalId.toHexString();

      const res = await request(server)
        .get('/api/rentals/' + rentalId);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /', () => {
    let payload;
    let customer;
    let customerId;
    let movie;
    let movieId;

    beforeEach(async () => {
      customerId = mongoose.Types.ObjectId();
      customer = new Customer({
        _id: customerId,
        name: 'TestCustomer',
        phone: 12345,
        isGold: true
      });
      await customer.save();

      movieId = mongoose.Types.ObjectId();
      movie = new Movie({
        _id: movieId,
        title: 'TestMovie',
        genre: { name: 'TestGenre' },
        numberInStock: 1,
        dailyRentalRate: 2
      });
      await movie.save();

      payload = {
        customerId: customerId,
        movieId: movieId
      };
    });

    const exec = () => {
      return request(server)
        .post('/api/rentals')
        .send(payload);
    };

    it('should return 200 and the rental object', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.customer._id).toBe(customerId.toHexString());
      expect(res.body.movie._id).toBe(movieId.toHexString());
    });

    it('should return 400 if customerId is not provided', async () => {
      payload.customerId = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if customerId is not valid', async () => {
      payload.customerId = '1';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 404 if customerId is not found', async () => {
      payload.customerId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 400 if movieId is not provided', async () => {
      payload.movieId = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if movieId is not valid', async () => {
      payload.movieId = '1';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 404 if movieId is not found', async () => {
      payload.movieId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 400 if the movie is not in stock', async () => {
      movieId = mongoose.Types.ObjectId();
      let newMovie = new Movie({
        _id: movieId,
        title: 'TestNewMovie',
        genre: { name: 'TestNewGenre' },
        numberInStock: 0,
        dailyRentalRate: 2
      });
      await newMovie.save();
      payload.movieId = movieId;
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });
});