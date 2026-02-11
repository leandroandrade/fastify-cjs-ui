# fastify-cjs

Modern REST API template using Fastify with CommonJS, featuring built-in web UI support with EJS templates, TailwindCSS, and Alpine.js.

## Features

- 🚀 **Fastify Framework**: Fast and low overhead web framework
- 📄 **EJS Templates**: Server-side rendering with layout support
- 🎨 **TailwindCSS v4**: Utility-first CSS framework with custom theme
- ⚡ **Alpine.js**: Lightweight reactive JavaScript framework
- 📚 **Swagger Documentation**: Auto-generated API documentation
- 🔧 **Error Handling**: Custom error pages (404, 500) for both views and API
- 🎯 **Plugin Architecture**: Modular and maintainable code structure
- 🧪 **Testing Ready**: Built-in test setup with Node.js test runner

## Get started

Installing dependencies:

```shell
npm install
```

Download Alpine.js:

```shell
npm run update:alpine
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
2. Start the server with hot-reload enabled
3. Watch for file changes in `./src`

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
npm run css:watch    # Watch and rebuild TailwindCSS on changes
npm run update:alpine # Download latest Alpine.js v3.x
npm run update:deps  # Update all UI dependencies
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
docker build -t leandromandrade/fastify-cjs .
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
│   │   └── main.js           # Global Alpine.js setup
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

### Alpine.js

Reactive components for interactivity:
```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

Global notification system:
```javascript
window.showSuccess('Operation successful!');
window.showError('An error occurred!');
window.showWarning('Warning message!');
window.showInfo('Information message!');
```

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
