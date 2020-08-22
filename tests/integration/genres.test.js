const request = require('supertest');
const mongoose = require('mongoose');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

let server;

describe('/api/genres', () => {
  beforeEach(() => { server = require('../../index'); });
  afterEach(async () => {
    await Genre.remove({});
    server.close();
  });

  describe('GET /', () => {
    it('should return all genres', async () => {
      await Genre.collection.insertMany([
        { name: 'genre1'},
        { name: 'genre2'},
        { name: 'genre3'}
      ]);

      const res = await request(server).get('/api/genres');

      expect(res.status).toBe(200);
      expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
      expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
      expect(res.body.some(g => g.name === 'genre3')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return the genre if valid id is passed', async () => {
      const genre = new Genre({ name: 'genre1' });
      const id = (await Genre.collection.insertOne(genre)).insertedId;
      const res = await request(server).get('/api/genres/' + id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });

    it('should return 404 if invalid id is passed', async () => {
      const res = await request(server).get('/api/genres/1');
      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id exists', async () => {
      const id = mongoose.Types.ObjectId().toHexString();
      const res = await request(server).get('/api/genres/' + id);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let name;

    const exec = () => {
      return request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'genre1';
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 400 (invalid) if genre is less than 5 characters', async () => {
      name = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 (invalid) if genre is greater than 255 characters', async () => {
      name = new Array(257).join('1');
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save the genre if it is valid', async () => {
      await exec();
      const genre = await Genre.find({ name: 'genre1' });
      expect(genre).not.toBeNull();
    });

    it('should return the genre if it is valid', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });

  describe('PUT /', () => {
    let id;
    let token;
    let update;

    const exec = () => {
      return request(server)
        .put('/api/genres/' + id)
        .set('x-auth-token', token)
        .send({ name: update });
    };

    beforeEach(async () => {
      token = (new User()).generateAuthToken();
      const genre = new Genre({ name: 'genre1' });
      id = (await Genre.collection.insertOne(genre)).insertedId;
      update = 'updated';
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';

      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 404 if invalid id is passed', async () => {
      id = '1';

      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id exists', async () => {
      id = mongoose.Types.ObjectId().toHexString();

      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 400 if genre has less than 5 characters', async () => {
      update = '1234';

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if genre has greater than 255 characters', async () => {
      update = new Array(257).join('1');

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should save genre if valid id and genre are passed', async () => {
      const res = await exec();
      const genre = await Genre.collection.findOne({ _id: id });
      expect(genre).toHaveProperty('name', 'updated');
    });

    it('should return 200 and updated genre if a valid id and genre are passed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'updated');
    });
  });

  describe('DELETE /', () => {
    let id;
    let token;

    const exec = () => {
      return request(server)
        .delete('/api/genres/' + id)
        .set('x-auth-token', token)
        .send();
    };

    beforeEach(async () => {
      const genre = new Genre({ name: 'genre1' });
      id = (await Genre.collection.insertOne(genre)).insertedId;
      token = (new User({ isAdmin: true })).generateAuthToken();
    });

    it('should return 401 if user is not logged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      token = (new User({ isAdmin: false })).generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });

    it('should return 404 if id is invalid', async () => {
      id = '1';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if no genre with the given id is found', async () => {
      id = mongoose.Types.ObjectId().toHexString();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should delete genre if valid id is given by admin', async () => {
      const res = await exec();

      const genreInDb = await Genre.findOne({ _id : id });
      expect(genreInDb).toBeNull();
    });

    it('should return the removed genre', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'genre1');
    });
  });
});