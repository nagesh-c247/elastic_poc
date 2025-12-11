const express = require('express');
const Order = require('../models/order');
const esSync = require('../services/esSync');

const router = express.Router();

router.get('/', async (req, res) => {
  const list = await Order.find();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const doc = await Order.findById(req.params.id);
  if (!doc) return res.status(404).send('Not found');
  res.json(doc);
});

router.post('/', async (req, res) => {
  const doc = await Order.create(req.body);
  await esSync.upsert('order', doc);
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  const doc = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).send('Not found');
  await esSync.upsert('order', doc);
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  const doc = await Order.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).send('Not found');
  await esSync.remove('order', req.params.id);
  res.sendStatus(204);
});

module.exports = router;
