const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const Customer = require('../models/customer');
const Joi = require('joi');

router.get('/', async (req, res) => {
  const result = await Customer.find();
  res.send(result);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const customer = await Customer
    .findOne({
      _id: req.params.id
    });
  if (!customer) {
    return res.status(404).send('Requested id was not found');
  }
  res.send(customer);
});

router.post('/', validate(validateCustomer), async (req, res) => {
  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold
  });

  try {
    const saveResult = await customer.save();
    res.send(saveResult);
  }
  catch (err) {
    for (field in err.errors) {
      console.log(err.errors[field].message);
    }
  }
});

router.put('/:id', async (req, res) => {
  const result = validate(req.body);
  if (!result) {
    return res.status(400).send(result.error.details[0].message);
  }

  const updateResult = await Customer.findOneAndUpdate({ _id: req.params.id }, {
    $set: {
      name: req.body.name,
      isGold: req.body.isGold,
      phone: req.body.phone
    }
  }, { new: true });

  if (updateResult === null) {
    return res.status(404).send('Customer with the requested id was not found');
  }
  res.send(updateResult);
});

router.delete('/:id', async (req, res) => {
  const result = await Customer.findOneAndDelete({ _id: req.params.id });
  if (result === null) {
    return res.status(404).send('Customer with the requested id was not found');
  }
  res.send(result);
});

function validateCustomer(body) {
  return Joi.object({
      name: Joi.string().min(3).required(),
      phone: Joi.string().required(),
      isGold: Joi.boolean()
    })
    .validate(body)
  ;
}

module.exports = router;