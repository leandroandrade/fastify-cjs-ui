const fp = require('fastify-plugin');
const rateLimit = require('@fastify/rate-limit');

async function rateLimitPlugin(fastify) {
  function keyByUserOrIp(req) {
    return req.user?.sub || req.ip;
  }

  function buildErrorResponse(req, context) {
    const err = new Error(`Muitas requisições. Tente novamente em ${context.after}.`);
    err.statusCode = 429;
    err.expose = true;

    return err;
  }

  function logExceeded(req, key) {
    req.log.warn({ key, url: req.url }, 'rate-limit-plugin: limite excedido');
  }

  // hook: 'preHandler' garante que um eventual requireAuth (onRequest) já populou
  // req.user antes do keyGenerator rodar — evita queda silenciosa para req.ip
  // em rotas autenticadas.
  await fastify.register(rateLimit, {
    global: true,
    hook: 'preHandler',
    max: 100,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
    keyGenerator: keyByUserOrIp,
    errorResponseBuilder: buildErrorResponse,
    onExceeded: logExceeded
  });

  fastify.decorate('rateLimitStrict', {
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute',
        keyGenerator: keyByUserOrIp
      }
    }
  });

  fastify.decorate('rateLimitDestrutivo', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 hour',
        keyGenerator: keyByUserOrIp
      }
    }
  });
}

module.exports = fp(rateLimitPlugin, {
  name: 'rate-limit'
});
