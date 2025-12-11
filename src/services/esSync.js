const { es } = require('../config');

function indexName(entity) {
  return `${entity}s`; // users, products, orders
}

async function upsert(entity, doc) {
  const { _id, __v, ...source } = doc;
  await es.index({ index: indexName(entity), id: _id.toString(), body: source });
}

async function remove(entity, id) {
  await es.delete({ index: indexName(entity), id });
}

module.exports = { upsert, remove };
