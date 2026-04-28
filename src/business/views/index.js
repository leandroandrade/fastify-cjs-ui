const fp = require('fastify-plugin');

async function viewsPlugin(app) {
  app.get('/', (req, reply) => {
    return reply.view('home', {
      title: 'Fastify CJS - REST API Template',
      scripts: ['api-demo.js'],
      currentPage: 'home'
    }, { layout: 'layout' });
  });

  app.get('/error/404', (req, reply) => {
    return reply.code(404).view('404.ejs');
  });

  app.get('/error/500', (req, reply) => {
    return reply.code(500).view('500.ejs');
  });

  return app;
}

module.exports = fp(viewsPlugin);
