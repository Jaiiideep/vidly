const request = require('supertest');
const mongoose = require('mongoose');
const { Customer } = require('../../models/customer');

describe('/api/customers', () => {
  let server;

  beforeEach(() => {
    server = require('../../index');
  });
  afterEach(async () => {
    await Customer.remove({});
    await server.close();
  });

  describe('GET /', () => {
    it('should return all customers', async () => {
      await Customer.collection.insertMany([
        { name: '12345', isGold: true, phone: '12345' },
        { name: '123456', isGold: false, phone: '123456' },
        { name: '1234567', isGold: true, phone: '1234567' },
      ]);

      const res = await request(server)
        .get('/api/customers');

      expect(res.status).toBe(200);
      expect(res.body.some(c => c.name === '12345')).toBeTruthy();
      expect(res.body.some(c => c.name === '123456')).toBeTruthy();
      expect(res.body.some(c => c.name === '1234567')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    let customerId;

    beforeEach(async () => {
      customerId = mongoose.Types.ObjectId();

      customer = new Customer({
        _id: customerId,
        name: '12345',
        phone: '12345',
        isGold: true
      });

      await customer.save();
      customerId = customerId.toHexString();
    });

    const exec = () => {
      return request(server)
        .get('/api/customers/' + customerId);
    };

    it('should customer with the given id', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body._id).toEqual(customerId);
      expect(res.body.name).toEqual('12345');
      expect(res.body.phone).toEqual('12345');
      expect(res.body.isGold).toBe(true);
    });

    it('should return 404 if invalid id is passed', async () => {
      customerId = '1';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if there is no customer with the given id', async () => {
      customerId = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let payload;

    beforeEach(async () => {
      payload = {
        name: '12345',
        phone: '12345',
        isGold: true
      };
    });

    const exec = () => {
      return request(server)
        .post('/api/customers/')
        .send(payload);
    };

    it('should return 200 and customer', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.name).toEqual(payload.name);
      expect(res.body.phone).toEqual(payload.phone);
      expect(res.body.isGold).toEqual(payload.isGold);
    });

    it('should return 400 if name is not provided', async () => {
      payload.name = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is less than 5 characters', async () => {
      payload.name = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is not provided', async () => {
      payload.phone = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is less than 5 characters', async () => {
      payload.phone = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return false isGold if not provided', async () => {
      payload = {
        name: '12345',
        phone: '12345'
      };
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.name).toEqual(payload.name);
      expect(res.body.phone).toEqual(payload.phone);
      expect(res.body.isGold).toBe(false);
    });
  });

  describe('PUT /:id', () => {
    let customerId;
    let customer;
    let payload;

    beforeEach(async () => {
      customerId = mongoose.Types.ObjectId();
      customer = new Customer({
        _id: customerId,
        name: '12345',
        phone: '12345',
        isGold: true
      });
      await customer.save();

      customerId = customerId.toHexString();

      payload = {
        name: 'tester',
        phone: '12345',
        isGold: false
      };
    });

    const exec = () => {
      return request(server)
        .put('/api/customers/' + customerId)
        .send(payload);
    };

    it('should return 200 and new customer', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(customerId);
      expect(res.body.name).toBe(payload.name);
      expect(res.body.phone).toBe(payload.phone);
      expect(res.body.isGold).toBe(payload.isGold);
    });

    it('should return 400 if no name is provided', async () => {
      payload.name = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if name is less than 5 characters', async () => {
      payload.name = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if no phone is provided', async () => {
      payload.phone = '';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if phone is less than 5 characters', async () => {
      payload.phone = '1234';
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 400 if isGold is not provided', async () => {
      payload = {
        name: 'tester',
        phone: '12345'
      };
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return 404 if no customer with the given id was found', async () => {
      customerId = mongoose.Types.ObjectId().toHexString();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if invalid customerId is passed', async () => {
      customerId = '1';
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /:id', () => {
    let customerId;
    let customer;

    beforeEach(async () => {
      customerId = mongoose.Types.ObjectId();
      customer = new Customer({
        _id: customerId,
        name: '12345',
        phone: '12345'
      });
      await customer.save();
      customerId = customerId.toHexString();
    });

    const exec = () => {
      return request(server)
        .delete('/api/customers/' + customerId);
    };

    it('should return 200 and the deleted customer', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(customerId);
      expect(res.body.name).toEqual(customer.name);
      expect(res.body.phone).toEqual(customer.phone);
      expect(res.body.isGold).toBe(false);
    });

    it('should return 404 if no customer with the given id is found', async () => {
      customerId = mongoose.Types.ObjectId().toHexString();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return 404 if invalid id is passed', async () => {
      customerId = '1';
      const res = await exec();
      expect(res.status).toBe(404);
    });
  });
});