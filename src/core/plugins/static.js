const fp = require('fastify-plugin');
const fastifyStatic = require('@fastify/static');
const path = require('path');

async function staticPlugin(fastify, opts) {
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', '..', '..', 'public'),
    prefix: '/public/'
  });
}

module.exports = fp(staticPlugin, {
  name: 'static'
});
