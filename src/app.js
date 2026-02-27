const autoLoad = require('@fastify/autoload');
const { join } = require('path');
const Fastify = require('fastify');

const createConfigs = require('./configs');

async function createApp(customConfigs = {}) {
  const defaultConfigs = createConfigs();
  const app = Fastify({
    ...defaultConfigs,
    ...customConfigs
  });

  await app.register(autoLoad, {
    dir: join(__dirname, 'core'),
    encapsulate: false,
    maxDepth: 0
  }).register(autoLoad, {
    dir: join(__dirname, 'business'),
    encapsulate: false,
    maxDepth: 0
  });

  return app;
}

module.exports = createApp;
