const fp = require('fastify-plugin');
const helmet = require('@fastify/helmet');

async function helmetPlugin(fastify) {
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'"],
        scriptSrcElem: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    referrerPolicy: { policy: 'no-referrer' },
    frameguard: { action: 'deny' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true
  });
}

module.exports = fp(helmetPlugin, { name: 'helmet' });
