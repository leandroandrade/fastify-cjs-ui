const { test, beforeEach, afterEach } = require('node:test');
const { chromium } = require('playwright');

const { buildApp } = require('../../shared/helper');

let fastify;
let browser;
let page;
const port = 3000;

beforeEach(async (t) => {
  fastify = await buildApp();
  browser = await chromium.launch({ headless: true });

  const context = await browser.newContext();
  page = await context.newPage();

  await fastify.listen({ port });
});

afterEach(async () => {
  await browser.close();
  await fastify.close();
});

test('[e2e] pagina 404 deve carregar corretamente para rotas nao encontradas', async (t) => {
  const response = await page.goto(`http://localhost:${port}/rota-inexistente`);
  t.assert.strictEqual(response.status(), 404, 'Deve retornar status 404');

  const title404 = page.locator('h1:has-text("404")');
  await page.waitForSelector('h1:has-text("404")', { timeout: 5000 });

  const isTitleVisible = await title404.isVisible();
  t.assert.ok(isTitleVisible, 'Título 404 deve estar visível');

  const subtitle = page.locator('h2:has-text("Página não encontrada")');
  const isSubtitleVisible = await subtitle.isVisible();
  t.assert.ok(isSubtitleVisible, 'Subtítulo deve estar visível');

  const message = page.locator('p:has-text("A página que você está procurando não existe ou foi movida")');
  const isMessageVisible = await message.isVisible();
  t.assert.ok(isMessageVisible, 'Mensagem explicativa deve estar visível');

  const homeButton = page.locator('a:has-text("Ir para a página inicial")');
  const isButtonVisible = await homeButton.isVisible();
  t.assert.ok(isButtonVisible, 'Botão de voltar para home deve estar visível');
});

test('[e2e] pagina 404 deve ter logo clicavel', async (t) => {
  await page.goto(`http://localhost:${port}/pagina-nao-existe`);
  await page.waitForSelector('h1:has-text("404")', { timeout: 5000 });

  const logo = page.locator('a:has(svg)').first();
  const isLogoVisible = await logo.isVisible();
  t.assert.ok(isLogoVisible, 'Logo deve estar visível na página 404');

  const href = await logo.getAttribute('href');
  t.assert.strictEqual(href, '/', 'Logo deve ter link para página inicial');
});

test('[e2e] botao de voltar da pagina 404 deve navegar para home', async (t) => {
  await page.goto(`http://localhost:${port}/rota-invalida`);
  await page.waitForSelector('h1:has-text("404")', { timeout: 5000 });

  const homeButton = page.locator('a:has-text("Ir para a página inicial")');
  await homeButton.click();

  await page.waitForTimeout(500);

  const currentUrl = page.url();
  t.assert.strictEqual(currentUrl, `http://localhost:${port}/`, 'Deve navegar para página inicial');

  const homeTitle = page.locator('h1:has-text("Fastify CJS")');
  const isTitleVisible = await homeTitle.isVisible();
  t.assert.ok(isTitleVisible, 'Deve estar na página home');
});

test('[e2e] pagina 404 deve ter footer com ano dinamico', async (t) => {
  await page.goto(`http://localhost:${port}/erro-404`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Aguarda Alpine.js carregar

  const footer = page.locator('footer');
  const isFooterVisible = await footer.isVisible();
  t.assert.ok(isFooterVisible, 'Footer deve estar visível na página 404');

  const currentYear = new Date().getFullYear().toString();
  const footerText = await footer.textContent();
  t.assert.ok(footerText.includes(currentYear), 'Footer deve conter o ano atual');
});

test('[e2e] rotas de API devem retornar JSON 404, nao HTML', async (t) => {
  const response = await page.goto(`http://localhost:${port}/api/rota-inexistente`);
  t.assert.strictEqual(response.status(), 404, 'Deve retornar status 404');

  const contentType = response.headers()['content-type'];
  t.assert.ok(contentType.includes('application/json'), 'Deve retornar JSON para rotas /api');

  const body = await response.json();
  t.assert.strictEqual(body.statusCode, 404, 'Body deve ter statusCode 404');
  t.assert.strictEqual(body.error, 'Not Found', 'Body deve ter error "Not Found"');
  t.assert.ok(body.message, 'Body deve ter mensagem de erro');
});

test('[e2e] pagina 404 deve ter Alpine.js carregado', async (t) => {
  await page.goto(`http://localhost:${port}/pagina-404`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  const alpineLoaded = await page.evaluate(() => typeof window.Alpine !== 'undefined');
  t.assert.ok(alpineLoaded, 'Alpine.js deve estar carregado na página 404');

  const footerHasYear = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const year = new Date().getFullYear().toString();
    return footer && footer.textContent.includes(year);
  });
  t.assert.ok(footerHasYear, 'Alpine.js deve estar funcionando (ano dinâmico no footer)');
});

test('[e2e] pagina 404 deve ter estilos TailwindCSS aplicados', async (t) => {
  await page.goto(`http://localhost:${port}/erro`);
  await page.waitForSelector('h1:has-text("404")', { timeout: 5000 });

  const stylesheets = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    return links.map(link => link.href);
  });

  const hasTailwindCSS = stylesheets.some(href => href.includes('styles.css'));
  t.assert.ok(hasTailwindCSS, 'Página 404 deve carregar o arquivo styles.css');

  const title404 = page.locator('h1:has-text("404")');
  const titleColor = await title404.evaluate(el => window.getComputedStyle(el).color);
  t.assert.notStrictEqual(titleColor, 'rgb(0, 0, 0)', 'Título deve ter cor customizada do Tailwind');
});

test('[e2e] multiplas requisicoes 404 devem sempre retornar a pagina de erro', async (t) => {
  const routes = ['/nao-existe', '/outra-rota', '/mais-uma-rota'];

  for (const route of routes) {
    const response = await page.goto(`http://localhost:${port}${route}`);

    t.assert.strictEqual(response.status(), 404, `${route} deve retornar 404`);

    const title404 = page.locator('h1:has-text("404")');
    await page.waitForSelector('h1:has-text("404")', { timeout: 5000 });
    const isTitleVisible = await title404.isVisible();
    t.assert.ok(isTitleVisible, `${route} deve mostrar página 404`);
  }
});
