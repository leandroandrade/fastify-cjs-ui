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

test('[e2e] estrutura completa da navegacao deve estar presente', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3000 });

  try {
    await page.goto('http://localhost:3000/');

    const homeMenu = page.locator('nav a:has-text("Home")').first();
    const apiDocsMenu = page.locator('nav a:has-text("API Docs")').first();
    const githubMenu = page.locator('nav a:has-text("GitHub")').first();

    await page.waitForSelector('nav a:has-text("Home")', { timeout: 5000 });

    const isHomeVisible = await homeMenu.isVisible();
    const isApiDocsVisible = await apiDocsMenu.isVisible();
    const isGithubVisible = await githubMenu.isVisible();

    t.assert.ok(isHomeVisible, 'Menu Home deve estar visível');
    t.assert.ok(isApiDocsVisible, 'Menu API Docs deve estar visível');
    t.assert.ok(isGithubVisible, 'Menu GitHub deve estar visível');

    const logo = page.locator('nav svg').first();
    const isLogoVisible = await logo.isVisible();
    t.assert.ok(isLogoVisible, 'Logo deve estar visível');

    const brandText = page.locator('nav strong:has-text("Fastify CJS")');
    const isBrandVisible = await brandText.isVisible();
    t.assert.ok(isBrandVisible, 'Texto Fastify CJS deve estar visível');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] navegacao para Home deve funcionar', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3001 });

  try {
    await page.goto('http://localhost:3001/');

    const homeMenu = page.locator('nav a:has-text("Home")').first();
    await homeMenu.click();

    await page.waitForTimeout(500);

    const currentUrl = page.url();
    t.assert.strictEqual(currentUrl, 'http://localhost:3001/', 'Deve estar na página home');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] logo deve navegar para pagina inicial', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3002 });

  try {
    await page.goto('http://localhost:3002/');
    await page.waitForSelector('nav', { timeout: 5000 });

    const logoLink = page.locator('nav a:has(svg)').first();
    await logoLink.click();

    await page.waitForTimeout(500);

    const currentUrl = page.url();
    t.assert.strictEqual(currentUrl, 'http://localhost:3002/', 'Logo deve navegar para página inicial');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] link do GitHub deve ter target blank', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3003 });

  try {
    await page.goto('http://localhost:3003/');
    await page.waitForSelector('nav', { timeout: 5000 });

    const githubLink = page.locator('nav a:has-text("GitHub")').first();
    const target = await githubLink.getAttribute('target');
    const rel = await githubLink.getAttribute('rel');
    const href = await githubLink.getAttribute('href');

    t.assert.strictEqual(target, '_blank', 'Link do GitHub deve ter target="_blank"');
    t.assert.strictEqual(rel, 'noopener noreferrer', 'Link do GitHub deve ter rel="noopener noreferrer"');
    t.assert.ok(href.includes('github.com'), 'Link do GitHub deve apontar para github.com');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] menu mobile deve estar presente e funcionar', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 } // iPhone SE size
  });
  const page = await context.newPage();

  await fastify.listen({ port: 3004 });

  try {
    await page.goto('http://localhost:3004/');
    await page.waitForSelector('nav', { timeout: 5000 });

    const mobileMenuButton = page.locator('nav button.lg\\:hidden').first();
    const isButtonVisible = await mobileMenuButton.isVisible();
    t.assert.ok(isButtonVisible, 'Botão de menu mobile deve estar visível em telas pequenas');

    const mobileMenu = page.locator('nav .lg\\:hidden.py-4');
    let isMenuVisible = await mobileMenu.isVisible();
    t.assert.ok(!isMenuVisible, 'Menu mobile deve estar oculto inicialmente');

    await mobileMenuButton.click();

    await page.waitForTimeout(300);
    isMenuVisible = await mobileMenu.isVisible();
    t.assert.ok(isMenuVisible, 'Menu mobile deve estar visível após clique');

    const homeItem = mobileMenu.locator('a:has-text("Home")');
    const apiDocsItem = mobileMenu.locator('a:has-text("API Docs")');
    const githubItem = mobileMenu.locator('a:has-text("GitHub")');

    t.assert.ok(await homeItem.isVisible(), 'Item Home deve estar visível no menu mobile');
    t.assert.ok(await apiDocsItem.isVisible(), 'Item API Docs deve estar visível no menu mobile');
    t.assert.ok(await githubItem.isVisible(), 'Item GitHub deve estar visível no menu mobile');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] menu mobile deve fechar ao clicar em um item', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();

  await fastify.listen({ port: 3005 });

  try {
    await page.goto('http://localhost:3005/');
    await page.waitForSelector('nav', { timeout: 5000 });

    const mobileMenuButton = page.locator('nav button.lg\\:hidden').first();
    await mobileMenuButton.click();

    await page.waitForTimeout(300);

    const mobileMenu = page.locator('nav .lg\\:hidden.py-4');
    const homeItem = mobileMenu.locator('a:has-text("Home")');
    await homeItem.click();

    await page.waitForTimeout(300);

    const isMenuVisible = await mobileMenu.isVisible();
    t.assert.ok(!isMenuVisible, 'Menu mobile deve fechar após clique em item');
  } finally {
    await browser.close();
    await fastify.close();
  }
});

test('[e2e] footer deve estar presente em todas as paginas', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await fastify.listen({ port: 3006 });

  try {
    await page.goto('http://localhost:3006/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer');
    const isFooterVisible = await footer.isVisible();
    t.assert.ok(isFooterVisible, 'Footer deve estar visível');

    const footerText = await footer.textContent();
    t.assert.ok(footerText.includes('Fastify CJS UI'), 'Footer deve conter "Fastify CJS"');
    t.assert.ok(footerText.includes('UI Template'), 'Footer deve conter "REST API Template"');

    const currentYear = new Date().getFullYear().toString();
    t.assert.ok(footerText.includes(currentYear), 'Footer deve exibir o ano atual');
  } finally {
    await browser.close();
    await fastify.close();
  }
});
