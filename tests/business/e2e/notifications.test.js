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

test('[e2e] sistema de notificacoes Alpine.js deve estar configurado', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3000 });

  try {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    await page.waitForTimeout(500);

    const notificationElement = page.locator('#notification-alert');
    const notificationExists = await notificationElement.count();
    t.assert.strictEqual(notificationExists, 1, 'Elemento de notificação deve existir');

    const isVisible = await notificationElement.isVisible();
    t.assert.ok(!isVisible, 'Notificação deve estar oculta inicialmente');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] notificacao de sucesso deve aparecer ao clicar no botao Success', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3001 });

  try {
    await page.goto('http://localhost:3001/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const successButton = page.locator('button:has-text("Success")');
    await successButton.click();

    const notificationElement = page.locator('#notification-alert');
    await notificationElement.waitFor({ state: 'visible', timeout: 3000 });

    const isVisible = await notificationElement.isVisible();
    t.assert.ok(isVisible, 'Notificação deve estar visível após clicar no botão');

    const notificationText = await notificationElement.textContent();
    t.assert.ok(notificationText.includes('sucesso'), 'Notificação deve conter mensagem de sucesso');

    const successIcon = notificationElement.locator('svg.text-green-600').first();
    await successIcon.waitFor({ state: 'visible', timeout: 3000 });
    t.assert.ok(await successIcon.isVisible(), 'Notificação de sucesso deve ter ícone verde');

    const icons = notificationElement.locator('svg');
    const iconCount = await icons.count();
    t.assert.ok(iconCount > 0, 'Deve haver ícones na notificação');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] notificacao de erro deve aparecer ao clicar no botao Error', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3002 });

  try {
    await page.goto('http://localhost:3002/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const errorButton = page.locator('button:has-text("Error")');
    await errorButton.click();

    const notificationElement = page.locator('#notification-alert');
    await notificationElement.waitFor({ state: 'visible', timeout: 3000 });

    const isVisible = await notificationElement.isVisible();
    t.assert.ok(isVisible, 'Notificação deve estar visível após clicar no botão');

    const notificationText = await notificationElement.textContent();
    t.assert.ok(notificationText.includes('erro'), 'Notificação deve conter mensagem de erro');

    const errorIcon = notificationElement.locator('svg.text-red-600').first();
    await errorIcon.waitFor({ state: 'visible', timeout: 3000 });
    t.assert.ok(await errorIcon.isVisible(), 'Notificação de erro deve ter ícone vermelho');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] notificacao de warning deve aparecer ao clicar no botao Warning', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3003 });

  try {
    await page.goto('http://localhost:3003/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const warningButton = page.locator('button:has-text("Warning")');
    await warningButton.click();

    const notificationElement = page.locator('#notification-alert');
    await notificationElement.waitFor({ state: 'visible', timeout: 3000 });

    const isVisible = await notificationElement.isVisible();
    t.assert.ok(isVisible, 'Notificação deve estar visível após clicar no botão');

    const notificationText = await notificationElement.textContent();
    t.assert.ok(notificationText.includes('Atenção'), 'Notificação deve conter mensagem de atenção');

    const warningIcon = notificationElement.locator('svg.text-amber-600').first();
    await warningIcon.waitFor({ state: 'visible', timeout: 3000 });
    t.assert.ok(await warningIcon.isVisible(), 'Notificação de warning deve ter ícone âmbar');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] notificacao de info deve aparecer ao clicar no botao Info', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3004 });

  try {
    await page.goto('http://localhost:3004/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const infoButton = page.locator('button:has-text("Info")');
    await infoButton.click();

    const notificationElement = page.locator('#notification-alert');
    await notificationElement.waitFor({ state: 'visible', timeout: 3000 });

    const isVisible = await notificationElement.isVisible();
    t.assert.ok(isVisible, 'Notificação deve estar visível após clicar no botão');

    const notificationText = await notificationElement.textContent();
    t.assert.ok(notificationText.includes('Informação'), 'Notificação deve conter mensagem de informação');

    const infoIcon = notificationElement.locator('svg.text-blue-600').first();
    await infoIcon.waitFor({ state: 'visible', timeout: 3000 });
    t.assert.ok(await infoIcon.isVisible(), 'Notificação de info deve ter ícone azul');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] notificacao deve desaparecer automaticamente apos timeout', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3005 });

  try {
    await page.goto('http://localhost:3005/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const successButton = page.locator('button:has-text("Success")');
    await successButton.click();

    const notificationElement = page.locator('#notification-alert');
    await notificationElement.waitFor({ state: 'visible', timeout: 3000 });

    let isVisible = await notificationElement.isVisible();
    t.assert.ok(isVisible, 'Notificação deve estar visível após clicar');

    await page.waitForTimeout(5500);

    isVisible = await notificationElement.isVisible();
    t.assert.ok(!isVisible, 'Notificação deve desaparecer após timeout');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] factory Alpine.notificadores deve estar disponivel e disparar notificacao', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3006 });

  try {
    await page.goto('http://localhost:3006/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const factoryType = await page.evaluate(() => typeof window.Alpine.notificadores);
    t.assert.strictEqual(factoryType, 'function', 'Alpine.notificadores deve ser uma função');

    const metodos = await page.evaluate(() => {
      const helpers = window.Alpine.notificadores();
      return {
        sucesso: typeof helpers.notificarSucesso,
        erro: typeof helpers.notificarErro,
        aviso: typeof helpers.notificarAviso,
        info: typeof helpers.notificarInfo
      };
    });
    t.assert.strictEqual(metodos.sucesso, 'function', 'notificarSucesso deve ser uma função');
    t.assert.strictEqual(metodos.erro, 'function', 'notificarErro deve ser uma função');
    t.assert.strictEqual(metodos.aviso, 'function', 'notificarAviso deve ser uma função');
    t.assert.strictEqual(metodos.info, 'function', 'notificarInfo deve ser uma função');

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: { message: 'Teste programático', type: 'success', duration: 5000 }
      }));
    });

    const notificationElement = page.locator('#notification-alert');
    await notificationElement.waitFor({ state: 'visible', timeout: 3000 });

    const notificationText = await notificationElement.textContent();
    t.assert.ok(notificationText.includes('Teste programático'), 'Notificação deve exibir mensagem customizada');
  } finally {
    await browser.close();
    await fastify.close();
  }
});
