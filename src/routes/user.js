const express = require('express');
const User = require('../models/user');
const esSync = require('../services/esSync');

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get single user
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('Not found');
  res.json(user);
});

// Create user
router.post('/', async (req, res) => {
  const user = await User.create(req.body);
  await esSync.upsert('user', user);
  res.status(201).json(user);
});

// Update user
router.put('/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) return res.status(404).send('Not found');
  await esSync.upsert('user', user);
  res.json(user);
});

// Delete user
router.delete('/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).send('Not found');
  await esSync.remove('user', req.params.id);
  res.sendStatus(204);
});

module.exports = router;
