const { kafkaProducer } = require('../config');

let connected = false;

async function connectProducer() {
  if (!connected) {
    await kafkaProducer.connect();
    connected = true;
  }
}

async function publishMutation(entity, operation, payload) {
  await connectProducer();
  const message = { entity, operation, payload };
  await kafkaProducer.send({
    topic: 'poc-events',
    messages: [{ value: JSON.stringify(message) }],
  });
}

module.exports = { publishMutation };
