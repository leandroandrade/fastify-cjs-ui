const fp = require('fastify-plugin');

async function defaultSchemas(fastify) {
  const schemaError = {
    type: 'object',
    properties: {
      statusCode: { type: 'integer' },
      error: { type: 'string' },
      message: { type: 'string' },
      code: { type: 'string' }
    }
  };

  fastify.addSchema({
    $id: 'error',
    ...schemaError
  });
}

module.exports = fp(defaultSchemas, { name: 'schema' });
