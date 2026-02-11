const fp = require('fastify-plugin');
const fastifyView = require('@fastify/view');
const ejs = require('ejs');
const { resolve } = require('node:path');

async function viewPlugin(fastify, opts) {
  fastify.register(fastifyView, {
    engine: {
      ejs
    },
    templates: 'templates',
    options: {
      filename: resolve('templates')
    },
    charset: 'utf-8'
  });
}

module.exports = fp(viewPlugin, {
  name: 'view'
});
