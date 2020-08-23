const mongoose = require('mongoose');
const request = require('supertest');
const { User } = require('../../models/user');

describe('/api/users', () => {
  let server;

  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    await User.remove({});
    await server.close();
  });

  describe('GET /me', () => {
    let user;
    let userId;
    let token;

    beforeEach(async () => {
      userId = mongoose.Types.ObjectId();
      user = new User({
        _id: userId,
        name: 'TestUser',
        email: 'test@domain.com',
        password: '12345'
      });
      await user.save();
      userId = userId.toHexString();
      token = user.generateAuthToken();
    });

    const exec = () => {
      return request(server)
        .get('/api/users/me')
        .set('x-auth-token', token);
    };

    it('should return 200 and user without the password', async () => {
      const res = await exec();
      expect(res.body._id).toBe(userId);
      expect(res.body.name).toBe(user.name);
      expect(res.body.email).toBe(user.email);
    });
  });

  describe('POST /', () => {
    let payload;

    beforeEach(async () => {
      payload = {
        name: 'TestUser',
        email: 'test@domain.com',
        password: '12345'
      };
    });

    const exec = () => {
      return request(server)
        .post('/api/users/')
        .send(payload);
    };

    it('should return 200 and save the user', async () => {
      const res = await exec();
      const userInDb = await User.findOne({ email: payload.email });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(userInDb.name);
      expect(res.body.email).toBe(userInDb.email);
    });

    it('should return 400 if no name is provided', async () => {
      payload.name = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if no email is provided', async () => {
      payload.email = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if no password is provided', async () => {
      payload.password = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if user is already registered with the provided email', async () => {
      let userId = mongoose.Types.ObjectId();
      let user = new User({
        _id: userId,
        name: 'TestUser',
        email: 'duplicate@domain.com',
        password: '12345'
      });
      await user.save();
      payload.email = 'duplicate@domain.com';
      const res = await exec();
      expect(res.status).toBe(400);
    });
  });
});