const fp = require('fastify-plugin');
const createError = require('@fastify/error');

const SecFetchValidationError = createError('SEC_FETCH_VALIDATION_ERROR', '%s', 403);

async function secFetchValidationPlugin(fastify) {
  const allowedOrigins = fastify.allowedOrigins;

  const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

  function getHostWithoutPort(hostHeader = '') {
    // ex: "api.example.com:443" -> "api.example.com"
    return hostHeader.split(':')[0].trim().toLowerCase();
  }

  function originFromHeaders(req) {
    const origin = req.headers.origin;
    if (origin) return origin;

    const referer = req.headers.referer;
    if (!referer) return null;

    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }

  function parseOrigin(originValue) {
    try {
      return new URL(originValue);
    } catch {
      return null;
    }
  }

  /**
   * Valores para o Sec-Fetch-Site:
   *
   * same-origin: A requisição vem da mesma origem (mesmo protocolo, domínio e porta)
   * same-site: A requisição vem do mesmo site (mas pode ser subdomínio diferente)
   * cross-site: A requisição vem de um site completamente diferente
   * none: A requisição foi iniciada diretamente pelo usuário (digitando URL, bookmark, etc.)
   */
  fastify.decorate('secFetchSiteProtection', (req, reply, done) => {
    if (!fastify.isApiRequest(req)) {
      return done();
    }
    if (SAFE_METHODS.includes(req.method)) {
      return done();
    }

    const secFetchSite = req.headers['sec-fetch-site'];
    const requestHost = getHostWithoutPort(req.headers.host || '');

    if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
      return done();
    }

    if (secFetchSite === 'cross-site') {
      const originValue = originFromHeaders(req);
      if (originValue && allowedOrigins.has(originValue)) {
        return done();
      }

      fastify.log.error({ origin: originValue, secFetchSite, requestHost }, 'sec-fetch-validation: cross-site requests not allowed');
      return done(new SecFetchValidationError('Cross-site requests not allowed'));
    }

    // Para same-site/none/ausente/desconhecido => exige Origin/Referer (evita bypass)
    const originValue = originFromHeaders(req);
    if (!originValue) {
      fastify.log.error({ secFetchSite, requestHost }, 'sec-fetch-validation: missing Origin/Referer');
      return done(new SecFetchValidationError('Missing Origin/Referer'));
    }

    const originUrl = parseOrigin(originValue);
    if (!originUrl) {
      fastify.log.error({ origin: originValue, secFetchSite, requestHost }, 'sec-fetch-validation: invalid Origin/Referer');
      return done(new SecFetchValidationError('Invalid Origin/Referer'));
    }

    const originHost = originUrl.host.toLowerCase();

    if (originHost === requestHost) {
      return done();
    }
    if (allowedOrigins.has(originUrl.origin)) {
      return done();
    }

    fastify.log.error({ origin: originUrl.origin, originHost, secFetchSite, requestHost }, 'sec-fetch-validation: request origin not allowed');
    return done(new SecFetchValidationError('Request origin not allowed'));
  });

  fastify.addHook('onRequest', fastify.secFetchSiteProtection);
}

module.exports = fp(secFetchValidationPlugin, {
  name: 'sec-fetch-validation',
  dependencies: ['env', 'api-request']
});
