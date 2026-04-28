const fp = require('fastify-plugin');

async function viewsPlugin(app) {
  app.get('/', (req, reply) => {
    return reply.view('home', {
      title: 'Fastify CJS - REST API Template',
      scripts: ['api-demo.js'],
      currentPage: 'home'
    }, { layout: 'layout' });
  });

  return app;
}

module.exports = fp(viewsPlugin);
