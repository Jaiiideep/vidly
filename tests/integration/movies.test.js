const request = require('supertest');
const mongoose = require('mongoose');
const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');
const { identity } = require('lodash');


describe('/api/movies', () => {
  let server;

  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    await Movie.remove({});
    await Genre.remove({});
    await server.close();
  });

  describe('GET /', () => {
    it('should return all movies', async () => {
      await Movie.collection.insertMany([
        {
          title: 'test1',
          genre: { name: 'genre1'},
          numberInStock: '1',
          dailyRentalRate: 1
        },
        {
          title: 'test2',
          genre: { name: 'genre2'},
          numberInStock: '2',
          dailyRentalRate: 2
        },
        {
          title: 'test3',
          genre: { name: 'genre3'},
          numberInStock: '3',
          dailyRentalRate: 3
        }
      ]);

      const res = await request(server)
        .get('/api/movies');

      expect(res.status).toBe(200);
      expect(res.body.some(m => m.title === 'test1')).toBeTruthy();
      expect(res.body.some(m => m.title === 'test2')).toBeTruthy();
      expect(res.body.some(m => m.title === 'test3')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let movieId;
    let movie;

    beforeEach(async () => {
      movieId = mongoose.Types.ObjectId();
      movie = new Movie({
        _id: movieId,
        title: 'TestMovie',
        genre: { name: 'TestGenre' },
        numberInStock: 1,
        dailyRentalRate: 2
      });
      await movie.save();
      movieId = movieId.toHexString();
    });

    const exec = () => {
      return request(server)
        .get('/api/movies/' + movieId);
    };

    it('should return 200 and movie with the given id', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(movieId);
      expect(res.body.title).toEqual(movie.title);
      expect(res.body.numberInStock).toEqual(movie.numberInStock);
      expect(res.body.dailyRentalRate).toEqual(movie.dailyRentalRate);
    });

    it('should return 404 if there is no movie with the given id', async () => {
      movieId = mongoose.Types.ObjectId().toHexString();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if invalid id is passed', async () => {
      movieId = '1';
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let genre;
    let genreId;
    let payload;

    beforeEach(async () => {
      genreId = mongoose.Types.ObjectId();
      genre = new Genre({
        _id: genreId,
        name: 'TestGenre'
      });
      await genre.save();

      genreId = genreId.toHexString();

      payload = {
        title: 'TestMovie',
        genreId: genreId,
        numberInStock: 1,
        dailyRentalRate: 2
      };
    });

    const exec = () => {
      return request(server)
        .post('/api/movies/')
        .send(payload);
    };

    it('should return 200 and the movie', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.title).toEqual(payload.title);
      expect(res.body.numberInStock).toEqual(payload.numberInStock);
      expect(res.body.dailyRentalRate).toEqual(payload.dailyRentalRate);
    });

    it('should return 400 if title is not passed', async () => {
      payload.title = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is not 5 characters', async () => {
      payload.title = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is not passed', async () => {
      payload.numberInStock = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is less than 0', async () => {
      payload.numberInStock = -1;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is not passed', async () => {
      payload.dailyRentalRate = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is less than 0', async () => {
      payload.dailyRentalRate = -1;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genreId is not provided', async () => {
      payload.genreId = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid genreId is provided', async () => {
      payload.genreId = '1';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genre with the given id is not found', async () => {
      payload.genreId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id', () => {
    let movie;
    let movieId;
    let genre;
    let genreId;
    let payload;

    beforeEach(async () => {
      movieId = mongoose.Types.ObjectId();
      movie = new Movie({
        _id: movieId,
        title: 'TestMovie',
        genre: { name: 'TestGenre' },
        numberInStock: 1,
        dailyRentalRate: 2
      });
      await movie.save();
      movieId = movieId.toHexString();

      genreId = mongoose.Types.ObjectId();
      genre = new Genre({
        _id: genreId,
        name: 'TesterGenre'
      });
      await genre.save();
      genreId = genreId.toHexString();

      payload = {
        title: 'TesterMovie',
        genreId: genreId,
        numberInStock: 10,
        dailyRentalRate: 10
      };
    });

    const exec = () => {
      return request(server)
        .put('/api/movies/' + movieId)
        .send(payload);
    };

    it('should return 200 and new customer', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(movieId);
      expect(res.body.title).toBe(payload.title);
      expect(res.body.numberInStock).toBe(payload.numberInStock);
      expect(res.body.dailyRentalRate).toBe(payload.dailyRentalRate);
      expect(res.body.genre._id).toBe(payload.genreId);
    });

    it('should return 400 if title is not passed', async () => {
      payload.title = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is less than 5 characters', async () => {
      payload.title = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genreId is not passed', async () => {
      payload.genreId = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genreId is invalid', async () => {
      payload.genreId = '1';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if there is no genre for the given genreId', async () => {
      payload.genreId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if numberInStock is not passed', async () => {
      payload.numberInStock = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if dailyRentalRate is not passed', async () => {
      payload.dailyRentalRate = null;
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /:id', () => {
    let movie;
    let movieId;

    beforeEach(async () => {
      movieId = mongoose.Types.ObjectId();
      movie = new Movie({
        _id: movieId,
        title: 'TestMovie',
        genre: { name: 'TestGenre' },
        numberInStock: 1,
        dailyRentalRate: 2
      });
      await movie.save();
      movieId = movieId.toHexString();
    });

    const exec = () => {
      return request(server)
        .delete('/api/movies/' + movieId);
    };

    it('should return 200 and the deleted movie', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(movieId);
      expect(res.body.name).toEqual(movie.name);
      expect(res.body.numberInStock).toEqual(movie.numberInStock);
      expect(res.body.dailyRentalRate).toEqual(movie.dailyRentalRate);
      expect(res.body.genre.name).toEqual(movie.genre.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      movieId = '1';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if there is no movie with the provided id', async () => {
      movieId = mongoose.Types.ObjectId().toHexString();
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });
});