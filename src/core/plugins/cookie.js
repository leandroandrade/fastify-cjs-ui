const fp = require('fastify-plugin');
const fastifyCookie = require('@fastify/cookie');

async function cookiePlugin(fastify, opts) {
  await fastify.register(fastifyCookie);
}

module.exports = fp(cookiePlugin, {
  name: 'cookie'
});
