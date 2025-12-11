const express = require('express');
const Product = require('../models/product');
const esSync = require('../services/esSync');

const router = express.Router();

router.get('/', async (req, res) => {
  const list = await Product.find();
  res.json(list);
});

router.get('/:id', async (req, res) => {
  const doc = await Product.findById(req.params.id);
  if (!doc) return res.status(404).send('Not found');
  res.json(doc);
});

router.post('/', async (req, res) => {
  const doc = await Product.create(req.body);
  await esSync.upsert('product', doc);
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  const doc = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).send('Not found');
  await esSync.upsert('product', doc);
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  const doc = await Product.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).send('Not found');
  await esSync.remove('product', req.params.id);
  res.sendStatus(204);
});

module.exports = router;
