const { test, beforeEach, afterEach } = require('node:test');
const { chromium } = require('playwright');

const { buildApp } = require('../../shared/helper');

let fastify;

beforeEach(async (t) => {
  fastify = await buildApp();
});

afterEach(async (t) => {
  await fastify.close();
});

test('[e2e] home page deve carregar corretamente com todos os elementos', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3000 });

  try {
    await page.goto('http://localhost:3000/');

    const title = page.locator('h1:has-text("Fastify CJS")');
    await page.waitForSelector('h1:has-text("Fastify CJS")', { timeout: 5000 });

    const isTitleVisible = await title.isVisible();
    t.assert.ok(isTitleVisible, 'Título principal deve estar visível');

    const description = page.locator('p:has-text("Template pronto para construção de APIs REST")');
    const isDescriptionVisible = await description.isVisible();
    t.assert.ok(isDescriptionVisible, 'Descrição deve estar visível');

    const apiDocsButton = page.locator('a:has-text("Ver Documentação da API")');
    const githubButton = page.locator('a:has-text("Ver no GitHub")');

    const isApiDocsVisible = await apiDocsButton.isVisible();
    const isGithubVisible = await githubButton.isVisible();

    t.assert.ok(isApiDocsVisible, 'Botão de documentação da API deve estar visível');
    t.assert.ok(isGithubVisible, 'Botão do GitHub deve estar visível');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] home page deve exibir os 6 cards de features', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3001 });

  try {
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');

    const featureCards = page.locator('.grid > div.bg-white');
    const cardCount = await featureCards.count();
    t.assert.strictEqual(cardCount, 6, 'Deve haver 6 cards de features');

    const fastifyCard = page.locator('h3:has-text("Fastify Framework")').first();
    const ejsCard = page.locator('h3:has-text("Templates EJS")').first();
    const tailwindCard = page.locator('h3:has-text("TailwindCSS v4")').first();
    const alpineCard = page.locator('h3:has-text("Alpine.js")').first();
    const docsCard = page.locator('h3:has-text("API Documentation")').first();
    const errorCard = page.locator('h3:has-text("Error Handling")').first();

    t.assert.ok(await fastifyCard.isVisible(), 'Card Fastify deve estar visível');
    t.assert.ok(await ejsCard.isVisible(), 'Card EJS deve estar visível');
    t.assert.ok(await tailwindCard.isVisible(), 'Card TailwindCSS deve estar visível');
    t.assert.ok(await alpineCard.isVisible(), 'Card Alpine.js deve estar visível');
    t.assert.ok(await docsCard.isVisible(), 'Card API Documentation deve estar visível');
    t.assert.ok(await errorCard.isVisible(), 'Card Error Handling deve estar visível');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] navegacao para API documentation deve funcionar', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3002 });

  try {
    await page.goto('http://localhost:3002/');

    const apiDocsButton = page.locator('a:has-text("Ver Documentação da API")').first();
    await apiDocsButton.click();

    await page.waitForTimeout(500);

    const currentUrl = page.url();
    t.assert.ok(currentUrl.includes('/docs'), 'Deve navegar para /docs');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] secao de getting started deve estar presente', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3003 });

  try {
    await page.goto('http://localhost:3003/');
    await page.waitForLoadState('networkidle');

    const gettingStarted = page.locator('h2:has-text("Começando")');
    const isGettingStartedVisible = await gettingStarted.isVisible();
    t.assert.ok(isGettingStartedVisible, 'Seção "Começando" deve estar visível');

    const npmInstall = page.locator('pre:has-text("npm install")');
    const updateAlpine = page.locator('pre:has-text("npm run update:alpine")');
    const npmDev = page.locator('pre:has-text("npm run dev")');

    t.assert.ok(await npmInstall.isVisible(), 'Comando npm install deve estar visível');
    t.assert.ok(await updateAlpine.isVisible(), 'Comando update:alpine deve estar visível');
    t.assert.ok(await npmDev.isVisible(), 'Comando npm run dev deve estar visível');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] demo de notificacoes deve estar presente', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3004 });

  try {
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');

    const demoTitle = page.locator('h2:has-text("Teste o Sistema de Notificações")');
    const isDemoTitleVisible = await demoTitle.isVisible();
    t.assert.ok(isDemoTitleVisible, 'Título da demo de notificações deve estar visível');

    const successButton = page.locator('button:has-text("Success")');
    const errorButton = page.locator('button:has-text("Error")');
    const warningButton = page.locator('button:has-text("Warning")');
    const infoButton = page.locator('button:has-text("Info")');

    t.assert.ok(await successButton.isVisible(), 'Botão Success deve estar visível');
    t.assert.ok(await errorButton.isVisible(), 'Botão Error deve estar visível');
    t.assert.ok(await warningButton.isVisible(), 'Botão Warning deve estar visível');
    t.assert.ok(await infoButton.isVisible(), 'Botão Info deve estar visível');
  } finally {
    await browser.close();
    await fastify.close();
  }
});
