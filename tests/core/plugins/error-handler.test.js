const Fastify = require('fastify');
const { test } = require('node:test');

const sensiblePlugin = require('../../../src/core/plugins/sensible');
const apiRequestPlugin = require('../../../src/core/plugins/api-request');
const errorHandler = require('../../../src/core/plugins/error-handler');

test('[core] schema validation errors return generic message', async (t) => {
  const fastify = Fastify();
  t.after(async () => { await fastify.close(); });

  await fastify.register(sensiblePlugin);
  await fastify.register(apiRequestPlugin);
  await fastify.register(errorHandler);

  const schema = {
    params: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          maxLength: 2
        }
      }
    }
  };
  fastify.get('/api/:message', { schema }, async (req, reply) => {
    t.assert.ifError('should not pass here!');
  });

  const response = await fastify.inject({
    method: 'GET',
    url: '/api/hello'
  });

  t.assert.strictEqual(response.statusCode, 400);
  const body = response.json();
  t.assert.strictEqual(body.statusCode, 400);
  t.assert.strictEqual(body.error, 'Bad Request');
  t.assert.strictEqual(body.message, 'Dados de entrada inválidos.');
  t.assert.strictEqual(body.code, 'FST_ERR_VALIDATION');
});

test('should return generic error for untyped 5xx', async t => {
  const fastify = Fastify();
  t.after(async () => { await fastify.close(); });

  await fastify.register(sensiblePlugin);
  await fastify.register(apiRequestPlugin);
  await fastify.register(errorHandler);

  fastify.get('/api/test', (request, reply) => {
    throw new Error('generic error');
  });

  const response = await fastify.inject('/api/test');

  t.assert.strictEqual(response.statusCode, 500);
  t.assert.deepStrictEqual(response.json(), {
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'Sorry, there was an error processing your request.'
  });
});

test('untyped 4xx returns generic message (info-leak protection)', async t => {
  class SomeError extends Error {
    constructor(message, statusCode) {
      super(message);

      this.statusCode = statusCode;
    }
  }

  const fastify = Fastify();
  t.after(async () => { await fastify.close(); });

  await fastify.register(sensiblePlugin);
  await fastify.register(apiRequestPlugin);
  await fastify.register(errorHandler);

  fastify.get('/api/test', (request, reply) => {
    throw new SomeError('Custom Error!', 422);
  });

  const response = await fastify.inject('/api/test');
  t.assert.strictEqual(response.statusCode, 422);

  t.assert.deepStrictEqual(response.json(), {
    statusCode: 422,
    error: 'Unprocessable Entity',
    message: 'Requisição inválida.'
  });
});

test('typed 4xx (httpErrors) passes through message', async t => {
  const fastify = Fastify();
  t.after(async () => { await fastify.close(); });

  await fastify.register(sensiblePlugin);
  await fastify.register(apiRequestPlugin);
  await fastify.register(errorHandler);

  fastify.get('/api/test', (request, reply) => {
    return fastify.httpErrors.unprocessableEntity('Custom Error!');
  });

  const response = await fastify.inject('/api/test');
  t.assert.strictEqual(response.statusCode, 422);

  const body = response.json();
  t.assert.strictEqual(body.statusCode, 422);
  t.assert.strictEqual(body.error, 'Unprocessable Entity');
  t.assert.strictEqual(body.message, 'Custom Error!');
});
