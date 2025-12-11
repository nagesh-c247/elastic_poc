const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
// const { Client: ESClient } = require('@elastic/elasticsearch');
const { Client:ESClient } = require('@opensearch-project/opensearch');
const redis = require('redis');

dotenv.config();

const {
  MONGO_URI = 'mongodb://root:example@localhost:27017',
  ES_NODE = 'https://search-test-poc-mcp4w4yljfzu35lw63g4fvbkl4.ap-south-1.es.amazonaws.com',
  ES_USERNAME="test_poc",
  ES_PASSWORD="Test_poc_15",
  // ES_NODE = 'http://localhost:9200',
  REDIS_URL = 'redis://localhost:6379',
} = process.env;

// MongoDB
const mongoClient = new MongoClient(MONGO_URI);
async function connectMongo() {
  if (!mongoClient.topology || !mongoClient.topology.isConnected()) {
    await mongoClient.connect();
  }
  return mongoClient.db('poc');
}

// Elasticsearch / OpenSearch
const esOptions = {
  node: ES_NODE,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

if (ES_USERNAME && ES_PASSWORD) {
  esOptions.auth = { username: ES_USERNAME, password: ES_PASSWORD };
}

const es = new ESClient(esOptions);

// Redis
const redisClient = redis.createClient({ url: REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Error', err));

module.exports = {
  connectMongo,
  mongoClient,
  es,
  redisClient,
};
