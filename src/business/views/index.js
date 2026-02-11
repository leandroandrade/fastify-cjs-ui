const fp = require('fastify-plugin');

async function viewsPlugin(app) {
  app.get('/', (req, reply) => {
    return reply.view('home', {
      title: 'Fastify CJS - REST API Template'
    }, { layout: 'layout' });
  });

  return app;
}

module.exports = fp(viewsPlugin);
