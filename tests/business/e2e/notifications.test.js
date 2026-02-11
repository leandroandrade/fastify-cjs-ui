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

    const borderClass = await notificationElement.getAttribute('class');
    t.assert.ok(borderClass.includes('border-green-600'), 'Notificação de sucesso deve ter borda verde');

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

    const borderClass = await notificationElement.getAttribute('class');
    t.assert.ok(borderClass.includes('border-red-600'), 'Notificação de erro deve ter borda vermelha');
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

    const borderClass = await notificationElement.getAttribute('class');
    t.assert.ok(borderClass.includes('border-amber-600'), 'Notificação de warning deve ter borda âmbar');
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

    const borderClass = await notificationElement.getAttribute('class');
    t.assert.ok(borderClass.includes('border-blue-600'), 'Notificação de info deve ter borda azul');
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

test('[e2e] funcoes globais de notificacao devem estar disponiveis', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3006 });

  try {
    await page.goto('http://localhost:3006/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const showSuccess = await page.evaluate(() => typeof window.showSuccess);
    const showError = await page.evaluate(() => typeof window.showError);
    const showWarning = await page.evaluate(() => typeof window.showWarning);
    const showInfo = await page.evaluate(() => typeof window.showInfo);
    const showNotification = await page.evaluate(() => typeof window.showNotification);

    t.assert.strictEqual(showSuccess, 'function', 'window.showSuccess deve ser uma função');
    t.assert.strictEqual(showError, 'function', 'window.showError deve ser uma função');
    t.assert.strictEqual(showWarning, 'function', 'window.showWarning deve ser uma função');
    t.assert.strictEqual(showInfo, 'function', 'window.showInfo deve ser uma função');
    t.assert.strictEqual(showNotification, 'function', 'window.showNotification deve ser uma função');

    await page.evaluate(() => {
      window.showSuccess('Teste programático');
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
