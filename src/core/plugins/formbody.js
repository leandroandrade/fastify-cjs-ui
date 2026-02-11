const fp = require('fastify-plugin');
const fastifyFormbody = require('@fastify/formbody');

async function formbodyPlugin(fastify, opts) {
  await fastify.register(fastifyFormbody);
}

module.exports = fp(formbodyPlugin, {
  name: 'formbody'
});
