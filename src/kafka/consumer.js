const { kafkaConsumer, es } = require('../config');

async function run() {
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({ topic: 'poc-events', fromBeginning: true });
  console.log('Kafka consumer connected, listening for events...');

  await kafkaConsumer.run({
    eachMessage: async ({ message }) => {
      try {
        const evt = JSON.parse(message.value.toString());
        const { entity, operation, payload } = evt;
        const index = `${entity}s`; // users, products, orders

        if (operation === 'delete') {
          await es.delete({ index, id: payload._id });
        } else if (operation === 'create' || operation === 'update') {
          await es.index({ index, id: payload._id, document: payload });
        }
        console.log(`Indexed ${operation} on ${entity}`);
      } catch (err) {
        console.error('Indexing error', err);
      }
    },
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
