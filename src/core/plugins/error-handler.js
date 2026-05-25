const { STATUS_CODES } = require('node:http');
const fp = require('fastify-plugin');

async function errorHandlerPlugin(fastify) {
  fastify.setErrorHandler((err, req, reply) => {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 400 && statusCode <= 499) {
      req.log.warn({ err }, err?.message);
    } else {
      req.log.error({ err }, err?.message);
    }

    if (statusCode >= 400 && statusCode <= 499) {
      // Erros de validação de JSON Schema vêm com `err.validation` (array AJV).
      // A mensagem crua pode expor nomes de campos internos; substituímos por
      // uma mensagem genérica e mantemos o detalhe no log.
      const isErroValidacaoSchema = Array.isArray(err?.validation);
      // Para os demais 4xx, repassa a mensagem só quando vem de fontes tipadas:
      // - @fastify/error: seta `err.code`
      // - httpErrors (http-errors): seta `err.expose === true`
      const isErroTipado = err?.expose === true || (typeof err?.code === 'string' && err.code.length > 0);

      let mensagemSegura;
      if (isErroValidacaoSchema) {
        mensagemSegura = 'Dados de entrada inválidos.';
      } else if (isErroTipado) {
        mensagemSegura = err.message;
      } else {
        mensagemSegura = 'Requisição inválida.';
      }

      const payload = {
        statusCode,
        error: STATUS_CODES[statusCode] || 'Bad Request',
        message: mensagemSegura
      };
      if (typeof err?.code === 'string' && err.code.length > 0) {
        payload.code = err.code;
      }

      return reply.code(statusCode).send(payload);
    }

    // Erros 5xx tipados via @fastify/error (ou httpErrors) carregam mensagem
    // intencional e segura; repassamos para o cliente. Erros não tipados
    // (TypeError, falhas de runtime) seguem squashados para mensagem genérica.
    const isErroTipado5xx = err?.expose === true || (typeof err?.code === 'string' && err.code.length > 0);

    if (fastify.isApiRequest(req)) {
      const mensagem = isErroTipado5xx ? err.message : 'Sorry, there was an error processing your request.';
      const codigo = isErroTipado5xx ? err.code : undefined;

      const payload = {
        statusCode,
        error: STATUS_CODES[statusCode] || 'Internal Server Error',
        message: mensagem
      };
      if (codigo) {
        payload.code = codigo;
      }

      return reply.code(statusCode).send(payload);
    }

    if (typeof reply.view === 'function') {
      return reply.status(statusCode).view('500.ejs');
    }

    return reply.code(statusCode).send({
      statusCode,
      error: STATUS_CODES[statusCode] || 'Internal Server Error',
      message: 'Sorry, there was an error processing your request.'
    });
  });
}

module.exports = fp(errorHandlerPlugin, {
  name: 'error-handler',
  dependencies: ['api-request']
});
