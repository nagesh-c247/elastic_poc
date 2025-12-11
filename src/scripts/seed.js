const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user');
const Product = require('../models/product');
const Order = require('../models/order');
const esSync = require('../services/esSync');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:example@localhost:27017/poc?authSource=admin';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Mongo connected');

  // clear
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);
  console.log('Cleared existing data');

  // users (10)
  const usersData = Array.from({ length: 10 }).map((_, i) => ({
    name: `User${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));
  const users = await User.insertMany(usersData);
  console.log(`Inserted ${users.length} users`);

  // products (6)
  const productsData = [
    { name: 'Phone', description: 'Flagship phone', price: 699 },
    { name: 'Laptop', description: 'Ultrabook', price: 1299 },
    { name: 'Headphones', description: 'Noise cancelling', price: 199 },
    { name: 'Monitor', description: '4K display', price: 399 },
    { name: 'Keyboard', description: 'Mechanical keyboard', price: 99 },
    { name: 'Mouse', description: 'Wireless mouse', price: 59 },
  ];
  const products = await Product.insertMany(productsData);
  console.log(`Inserted ${products.length} products`);

  // orders (6)
  const ordersData = [
    { userId: users[0]._id, productIds: [products[0]._id], total: 699 },
    { userId: users[1]._id, productIds: [products[1]._id], total: 1299 },
    { userId: users[2]._id, productIds: [products[2]._id, products[3]._id], total: 598 },
    { userId: users[3]._id, productIds: [products[4]._id, products[5]._id], total: 158 },
    { userId: users[4]._id, productIds: [products[0]._id, products[1]._id, products[2]._id], total: 2197 },
    { userId: users[5]._id, productIds: [products[3]._id], total: 399 },
  ];
  const orders = await Order.insertMany(ordersData);
  console.log(`Inserted ${orders.length} orders`);

  // index to Elasticsearch
  const docs = [
    ...users.map((u) => ({ entity: 'user', doc: u })),
    ...products.map((p) => ({ entity: 'product', doc: p })),
    ...orders.map((o) => ({ entity: 'order', doc: o })),
  ];

  let count = 0;
  for (const { entity, doc } of docs) {
    await esSync.upsert(entity, doc.toObject());
    count += 1;
    if (count % 5 === 0) {
      console.log(`Indexed ${count}/${docs.length}`);
    }
  }

  console.log('Seeding complete');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
