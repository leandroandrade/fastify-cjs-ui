const { chromium, firefox } = require('playwright');
const { buildApp } = require('./helper');

const NAVEGADORES = { chromium, firefox };

function selecionarNavegador(nome) {
  const escolhido = nome || process.env.E2E_BROWSER || 'chromium';
  const navegador = NAVEGADORES[escolhido];
  if (!navegador) {
    throw new Error(`e2e-helper: navegador "${escolhido}" não suportado. Use: ${Object.keys(NAVEGADORES).join(', ')}`);
  }

  return navegador;
}

async function iniciarServidor(t, customConfigs) {
  const fastify = await buildApp(customConfigs);
  await fastify.listen({ port: 0, host: '127.0.0.1' });

  t.after(async () => {
    await fastify.close();
  });

  const { port } = fastify.server.address();
  const baseUrl = `http://localhost:${port}`;

  return {
    fastify,
    baseUrl
  };
}

async function abrirNavegador(t, options = {}) {
  const { navegador, ...contextOptions } = options;

  const engine = selecionarNavegador(navegador);
  const browser = await engine.launch({ headless: true });
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  t.after(async () => {
    await browser.close();
  });

  return { browser, context, page };
}

module.exports = {
  iniciarServidor,
  abrirNavegador
};
