const { User } = require('../../models/user');
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

describe('/api/users', () => {
  let server;
  let userId;
  let userName;
  let userEmail;
  let userPassword;
  let admin;
  let payload;
  let hashedPassword;

  beforeEach(async () => {
    server = require('../../index');

    userId = mongoose.Types.ObjectId();
    userName = '12345';
    userEmail = 'test@domain.com'
    userPassword = '12345';
    admin = true;

    payload = {
      email: userEmail,
      password: userPassword
    };

    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(userPassword, salt);


    user = new User({
      _id: userId,
      name: userName,
      email: userEmail,
      password: hashedPassword,
      isAdmin: admin
    });

    await user.save();
  });
  afterEach(async () => {
    await User.remove({});
    await server.close();
  });

  const exec = () => {
    return request(server)
      .post('/api/auth')
      .send(payload);
  }

  it('should return 400 if email is not provided', async () => {
    payload = {
      password: userPassword
    }

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 400 if password is not provided', async () => {
    payload = {
      email: userEmail,
      password: 'random'
    }

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 400 if email does not match password', async () => {
    payload = {
      email: userEmail,
      password: '123456'
    }

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 400 if password does not match email', async () => {
    payload = {
      email: 'test@falseDomin.com',
      password: userPassword
    }

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it('should return 200', async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it('should return a valid token', async () => {
    const res = await exec();

    const decoded = jwt.verify(res.text, config.get('jwtPrivateKey'));

    expect(decoded._id).toBe(userId.toHexString());
    expect(decoded.isAdmin).toBe(true);
  });
});