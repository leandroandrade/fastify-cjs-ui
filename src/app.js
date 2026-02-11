const autoLoad = require('@fastify/autoload');
const { join } = require('path');
const Fastify = require('fastify');

const defaultConfigs = require('./configs');

async function createApp(customConfigs = {}) {
  const app = Fastify({
    ...defaultConfigs,
    routerOptions: { ...defaultConfigs.routerOptions },
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
