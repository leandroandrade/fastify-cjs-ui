const { test } = require('node:test');
const { buildApp } = require('../../shared/helper');

test('should return home page HTML', async (t) => {
  const fastify = await buildApp();
  t.after(async () => { await fastify.close(); });

  const res = await fastify.inject({
    method: 'GET',
    url: '/'
  });

  t.assert.strictEqual(res.statusCode, 200);
  t.assert.strictEqual(res.headers['content-type'], 'text/html; charset=utf-8');
  t.assert.ok(res.body.includes('<!DOCTYPE html>'), 'Response should contain HTML');
});
