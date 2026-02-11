const fp = require('fastify-plugin');

function isApiRequest(req) {
  return req.url.startsWith('/api/');
}

async function errorHandlerPlugin(fastify, opts) {

  const httpErrorNames = {
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot",
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons'
  };

  fastify.setErrorHandler((err, req, reply) => {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 400 && statusCode <= 499) {
      req.log.warn({ err }, err?.message);
    } else {
      req.log.error({ err }, err?.message);
    }

    if (statusCode >= 400 && statusCode <= 499) {
      return reply.code(statusCode).send({
        statusCode,
        error: httpErrorNames[statusCode] || 'Bad Request',
        message: err?.message || 'Erro de validação!'
      });
    }

    if (isApiRequest(req)) {
      return reply.code(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Sorry, there was an error processing your request.'
      });
    }

    if (typeof reply.view === 'function') {
      return reply.status(500).view('500.ejs');
    }

    return reply.code(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Sorry, there was an error processing your request.'
    });
  });
}

module.exports = fp(errorHandlerPlugin);
