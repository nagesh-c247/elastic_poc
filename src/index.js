const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { redisClient } = require('./config');
const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const orderRouter = require('./routes/order');
const searchRouter = require('./search/router');

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:example@localhost:27017/poc?authSource=admin';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    await redisClient.connect();
    console.log('Redis connected');

    const app = express();
    app.use(express.json());

    app.use('/users', userRouter);
    app.use('/products', productRouter);
    app.use('/orders', orderRouter);
    app.use('/search', searchRouter);

    app.get('/', (req, res) => res.send('POC API running'));

    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
