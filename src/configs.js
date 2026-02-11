const { randomUUID } = require('crypto');

/**
 * @type {import('fastify').FastifyServerOptions} Instance of Fastify
 */
module.exports = Object.freeze({
  disableRequestLogging: true,
  logger: {
    level: process.env.LOG_LEVEL || 'debug'
  },
  genReqId(req) {
    return req.headers['x-correlation-id'] || randomUUID();
  },
  ajv: {
    customOptions: {
      removeAdditional: 'all',   // Remove extra properties
      useDefaults: true,         // Apply default values
      coerceTypes: 'array',      // Coerce types (including scalar → array)
      allErrors: true            // Report all errors, not just first
    }
  },
  routerOptions: {
    ignoreTrailingSlash: true
  },
  // bodyLimit: 4 * 1024, // 4 KB
  bodyLimit: 5 * 1024 * 1024, // 5 MB (aligned with multipart fileSize limit)

  connectionTimeout: 120000,

  // 1 minute: suitable for most payloads, including moderate file uploads
  requestTimeout: 60000,

  // 10 seconds: ensures efficient resource usage for idle connections
  keepAliveTimeout: 10000,

  http: {
    // 15 seconds: prevents slow clients from holding connections too long
    headersTimeout: 15000
  },
  pluginTimeout: 90000
});
