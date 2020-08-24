const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { Customer } = require('../models/customer');
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

router.put('/:id', [validateObjectId, validate(validateCustomer)], async (req, res) => {
  if (req.body.isGold === undefined || req.body.isGold === null) {
    return res.status(400).send('Update requires isGold to be set');
  }
  const updateResult = await Customer.findOneAndUpdate({ _id: req.params.id }, {
    $set: {
      name: req.body.name,
      isGold: req.body.isGold,
      phone: req.body.phone
    }
  }, { new: true });

  if (!updateResult) {
    return res.status(404).send('Customer with the requested id was not found');
  }
  res.send(updateResult);
});

router.delete('/:id', validateObjectId, async (req, res) => {
  const result = await Customer.findOneAndDelete({ _id: req.params.id });
  if (!result) {
    return res.status(404).send('Customer with the requested id was not found');
  }
  res.send(result);
});

function validateCustomer(body) {
  return Joi.object({
      name: Joi.string().min(5).required(),
      phone: Joi.string().min(5).required(),
      isGold: Joi.boolean()
    })
    .validate(body)
  ;
}

module.exports = router;