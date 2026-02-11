module.exports = async (fastify, opts) => {
  fastify.get('/', async (req, reply) => {
    const name = req.query.name || 'World';

    return reply.send({
      message: `Hello ${name}!`,
      timestamp: new Date().toISOString(),
      success: true
    });
  });
};
