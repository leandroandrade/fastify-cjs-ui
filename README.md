# fastify-cjs-ui

Modern REST API template using Fastify with CommonJS, featuring built-in web UI support with EJS templates, TailwindCSS, and Alpine.js.

## Features

- 🚀 **Fastify Framework**: Fast and low overhead web framework
- 📄 **EJS Templates**: Server-side rendering with layout support
- 🎨 **TailwindCSS v4**: Utility-first CSS framework with custom theme
- 🧩 **Reusable CSS Components**: Pre-built `.btn-*`, `.card`, `.alert-*` classes
- ⚡ **Alpine.js**: Lightweight reactive JavaScript framework
- 🔔 **Toast Notifications**: Stacked notification system with `Alpine.notificadores()` factory
- 📚 **Swagger Documentation**: Auto-generated API documentation
- 🔧 **Error Handling**: Custom error pages (404, 500) for both views and API
- 🎯 **Plugin Architecture**: Modular and maintainable code structure
- 🧪 **Testing Ready**: Built-in test setup with Node.js test runner

## Get started

Installing dependencies:

```shell
npm install
```

Configure environment file:

```shell
cp .env.example .env
```

Start development server:

```shell
npm run dev
```

The development server will:
1. Build TailwindCSS automatically
2. Copy the Alpine.js assets from `node_modules` to `public/js`
3. Start the server with hot-reload enabled
4. Watch for file changes in `./src`

## Available Scripts

```shell
npm run dev           # Start development server with CSS build and hot-reload
npm start            # Start production server
npm test             # Run all tests (unit + E2E)
npm run test:only    # Run tests marked with test.only
npm run test:single  # Run single test file
npm run test:coverage # Run tests with coverage report
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run css:build    # Build TailwindCSS (production)
npm run js:build     # Copy Alpine.js assets from node_modules to public/js
```

## Testing

### Unit Tests

Run all unit tests:
```bash
npm test
```

## Accessing the Application

**Web Interface:**
```
http://localhost:3000/
```

**API Base URL:**
```
http://localhost:3000/api
```

**API Documentation (Swagger):**
```
http://localhost:3000/docs
```

## Build Image

Command to build docker image:
```shell
docker build -t leandromandrade/fastify-cjs-ui .
```

## Production

Starting application in production environment:

```shell
docker compose -f docker-compose-production.yml up -d --build
```

Stopping application in production environment:

```shell
docker compose -f docker-compose-production.yml down -v
```

Production URLs:
```
http://localhost:8080/              # Web Interface
http://localhost:8080/api           # API Base URL
http://localhost:8080/docs  # API Documentation
```

## Requests

All the API requests are available in the ```requests``` directory at the root path of the project.

## Structure of project

```
.
├── src
│   ├── app.js                 # Application factory
│   ├── server.js              # Server startup and graceful shutdown
│   ├── configs.js             # Fastify configuration
│   ├── business               # Business logic layer
│   │   ├── index.js
│   │   ├── decorators         # Fastify instance decorators
│   │   │   └── date.js
│   │   ├── repositories       # Data access layer
│   │   │   └── sample-repository.js
│   │   ├── routes             # API routes (prefix: /api)
│   │   │   └── sample
│   │   │       ├── index.js
│   │   │       └── schema.js
│   │   ├── views              # View routes (web pages)
│   │   │   └── index.js
│   │   └── swagger
│   │       └── sample-swagger.yaml
│   └── core                   # Infrastructure layer
│       ├── index.js
│       └── plugins
│           ├── env.js         # Environment variables
│           ├── error-handler.js # Error handling (API + Views)
│           ├── not-found.js   # 404 handler (API + Views)
│           ├── sensible.js    # HTTP utilities
│           ├── swagger.js     # API documentation
│           ├── view.js        # EJS template engine
│           ├── static.js      # Static file serving
│           ├── cookie.js      # Cookie support
│           └── formbody.js    # Form parsing
├── templates                  # EJS templates
│   ├── layout.ejs            # Base layout with navigation
│   ├── home.ejs              # Home page
│   ├── 404.ejs               # 404 error page
│   ├── 500.ejs               # 500 error page
│   └── css
│       └── custom.css        # TailwindCSS source
├── public                     # Static assets
│   ├── css
│   │   └── styles.css        # Compiled TailwindCSS
│   ├── js
│   │   ├── alpine.min.js     # Alpine.js library
│   │   ├── main.js           # Global Alpine setup (notifications + formatters)
│   │   └── api-demo.js       # Example Alpine component (API integration)
│   └── assets
│       └── favicon.ico
└── tests
    ├── business
    │   ├── decorators
    │   │   └── date.test.js
    │   └── routes
    │       └── sample-controller.test.js
    ├── core
    │   ├── integration
    │   │   └── swagger.test.js
    │   └── plugins
    │       ├── error-handler.test.js
    │       └── not-found.test.js
    └── shared
        └── helper.js
```

The main idea behind this structure is to separate the main project resources from the business features:

- **core**: Infrastructure plugins and core functionality needed by the entire application
- **business**: Business logic including API routes, view routes, decorators, and repositories
- **templates**: EJS templates for server-side rendering
- **public**: Static assets (CSS, JavaScript, images)

## UI Technologies

### TailwindCSS v4

Custom theme with primary colors:
- Primary Light: `#92d8fc`
- Primary: `#6399f1`
- Primary Dark: `#2e56e2`

Usage example:
```html
<button class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded">
  Click me
</button>
```

### Reusable CSS Components

Component classes are defined in `templates/css/custom.css` under `@layer components`. Use them to keep markup consistent across pages:

| Class | Purpose |
| --- | --- |
| `.btn-primary` / `.btn-secondary` / `.btn-danger` / `.btn-icon` | Standard button variants with disabled/hover states |
| `.card` | Surface container with border and dark mode |
| `.card-stat` | Compact card variant (centered, padded) for metrics |
| `.alert-info` / `.alert-success` / `.alert-warning` / `.alert-danger` | Inline alert boxes with semantic colors |

Example:
```html
<div class="card p-6">
  <h2 class="text-xl font-semibold">Title</h2>
  <button class="btn-primary mt-4">Action</button>
</div>

<div class="alert-danger" role="alert">
  <span>Something went wrong.</span>
</div>
```

### Alpine.js

Reactive components for interactivity:
```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

#### Notification System

The layout renders a stack of toasts (multiple notifications can be displayed simultaneously, each with auto-dismiss and a manual close button). Trigger a notification by dispatching the `show-notification` event — the recommended way is the `Alpine.notificadores()` factory, which exposes the helpers ready to be spread into any Alpine component:

```javascript
function meuComponente() {
  return {
    ...Alpine.notificadores(),

    async salvar() {
      try {
        await fetch('/api/...', { method: 'POST' });
        this.notificarSucesso('Registro salvo');
      } catch (err) {
        this.notificarErro('Falha ao salvar');
      }
    }
  };
}
```

Available methods (all accept an optional `duracao` in ms):
- `notificarSucesso(mensagem)`
- `notificarErro(mensagem)`
- `notificarAviso(mensagem)`
- `notificarInfo(mensagem)`

If you need to trigger a notification from outside an Alpine component, dispatch the underlying event directly:

```javascript
window.dispatchEvent(new CustomEvent('show-notification', {
  detail: { message: 'Hello', type: 'success', duration: 5000 }
}));
```

#### Formatters Store

A shared `Alpine.store('formatters')` provides reusable formatting helpers. Use it via `$store.formatters` in templates:

```html
<span x-text="$store.formatters.formatarDataRelativa(item.criado_em)"></span>
```

Add new formatters to `public/js/main.js` to make them available across all pages.

### EJS Templates

Server-side rendering with layouts:
```javascript
reply.view('template-name', { data }, { layout: 'layout' });
```

## Error Handling

The application automatically detects request type and responds accordingly:

- **API requests** (`/api/*`): Returns JSON error responses
- **View requests**: Renders custom error pages (404.ejs, 500.ejs)

## Creating New Views

1. Add route in `src/business/views/index.js`:
```javascript
app.get('/my-page', (req, reply) => {
  return reply.view('my-page', { data }, { layout: 'layout' });
});
```

2. Create template in `templates/my-page.ejs`:
```html
<div class="container mx-auto px-6 py-12">
  <h1 class="text-3xl font-bold">My Page</h1>
  <!-- Your content here -->
</div>
```

## Color Scheme

The template uses a blue color palette:
- Use `text-primary`, `bg-primary`, `border-primary` for primary color
- Use `hover:bg-primary-dark` for hover states
- Full dark mode support with `dark:` prefix

## License

Licensed under [MIT](./LICENSE).
