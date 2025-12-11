const express = require('express');
const { es, redisClient } = require('../config');

const router = express.Router();

const validEntities = ['user', 'product', 'order'];

router.get('/', async (req, res) => {
  const { entity, q } = req.query;
  if (!entity || !q || !validEntities.includes(entity)) {
    return res.status(400).send('Provide entity=user|product|order and q parameters');
  }

  const cacheKey = `${entity}:${q}`;
  try {
    // try redis
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // search ES
    const index = `${entity}s`;
    const { body } = await es.search({
      index,
      size: 20,
      body: {
        query: {
          multi_match: {
            query: q,
            fields: ['name', 'description', 'email', 'total'],
            fuzziness: 'AUTO',
          },
        },
      },
    });

    const hits = body.hits;

    const results = hits.hits.map((h) => ({ id: h._id, ...h._source }));

    // cache 60 seconds
    await redisClient.set(cacheKey, JSON.stringify(results), {
      EX: 60,
    });

    res.json(results);
  } catch (err) {
    console.error('Search error', err);
    res.status(500).send('Search failed');
  }
});

module.exports = router;
