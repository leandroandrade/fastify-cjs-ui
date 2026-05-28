const { describe, test } = require('node:test');
const { buildApp } = require('../../shared/helper');

async function createTestApp() {
  const fastify = await buildApp();

  const handler = (req, reply) => {
    reply.send({ ok: true });
  };

  fastify.get('/api/test-route', handler);
  fastify.post('/api/test-route', handler);

  return fastify;
}

describe('sec-fetch-validation plugin', () => {
  test('safe methods always pass without sec-fetch headers', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const getResponse = await fastify.inject({
      method: 'GET',
      url: '/api/test-route'
    });
    t.assert.strictEqual(getResponse.statusCode, 200);

    const headResponse = await fastify.inject({
      method: 'HEAD',
      url: '/api/test-route'
    });
    t.assert.strictEqual(headResponse.statusCode, 200);
  });

  test('same-origin allowed on POST', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        'sec-fetch-site': 'same-origin',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 200);
  });

  test('same-site allowed on POST', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        'sec-fetch-site': 'same-site',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 200);
  });

  test('cross-site with allowed origin passes', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        'sec-fetch-site': 'cross-site',
        origin: 'http://localhost:3000',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 200);
  });

  test('cross-site with disallowed origin returns 403', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        'sec-fetch-site': 'cross-site',
        origin: 'http://evil.com',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 403);
  });

  test('cross-site without origin or referer returns 403', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        'sec-fetch-site': 'cross-site',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 403);
  });

  test('absent sec-fetch-site with matching host origin passes', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        origin: 'http://localhost',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 200);
  });

  test('absent sec-fetch-site without origin or referer returns 403', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 403);
  });

  test('referer fallback when origin is absent', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        referer: 'http://localhost/some-path',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 200);
  });

  test('invalid origin URL returns 403', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        origin: 'not-a-url',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 403);
  });

  test('origin host mismatch and not in allowed list returns 403', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        origin: 'http://evil.com',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 403);
  });

  test('sec-fetch-site none with allowed origin passes', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        'sec-fetch-site': 'none',
        origin: 'http://localhost:3000',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 200);
  });

  test('blocked request returns 403 with SEC_FETCH_VALIDATION_ERROR code', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        'sec-fetch-site': 'cross-site',
        origin: 'http://evil.com',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 403);

    const body = response.json();
    t.assert.strictEqual(body.statusCode, 403);
    t.assert.strictEqual(body.error, 'Forbidden');
    t.assert.ok(body.message);
  });

  test('global hook protects /api/* without per-route preHandler', async (t) => {
    const fastify = await createTestApp();
    t.after(async () => { await fastify.close(); });

    const response = await fastify.inject({
      method: 'POST',
      url: '/api/test-route',
      headers: {
        'sec-fetch-site': 'cross-site',
        origin: 'http://evil.com',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 403);
    t.assert.strictEqual(response.json().error, 'Forbidden');
  });

  test('hook não valida rotas fora de /api/* — POST cross-site passa', async (t) => {
    const fastify = await buildApp();
    t.after(async () => { await fastify.close(); });

    fastify.post('/fora-da-api', (req, reply) => {
      return reply.send({ ok: true });
    });

    const response = await fastify.inject({
      method: 'POST',
      url: '/fora-da-api',
      headers: {
        'sec-fetch-site': 'cross-site',
        origin: 'http://evil.com',
        'content-type': 'application/json'
      },
      body: {}
    });

    t.assert.strictEqual(response.statusCode, 200);
  });
});
