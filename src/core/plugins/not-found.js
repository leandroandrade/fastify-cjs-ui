const fp = require('fastify-plugin');

function isApiRequest(req) {
  return req.url.startsWith('/api/');
}

async function notfoundPlugin(fastify) {
  fastify.setNotFoundHandler((req, reply) => {
    if (isApiRequest(req)) {
      return fastify.httpErrors.notFound('Sorry, we could not find what you were looking for.');
    }

    if (typeof reply.view === 'function') {
      return reply.status(404).view('404.ejs');
    }

    return fastify.httpErrors.notFound('Sorry, we could not find what you were looking for.');
  });
}

module.exports = fp(notfoundPlugin, {
  dependencies: ['env', 'view']
});
