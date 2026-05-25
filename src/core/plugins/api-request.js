const fp = require('fastify-plugin');

async function apiRequestPlugin(fastify) {
  function isApiRequest(req) {
    return req.url.startsWith('/api/');
  }

  fastify.decorate('isApiRequest', isApiRequest);
}

module.exports = fp(apiRequestPlugin, {
  name: 'api-request'
});
