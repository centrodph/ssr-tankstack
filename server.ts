import express, { type Express, type Request, type Response } from 'express';
import compression from 'compression';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ViteDevServer } from 'vite';

const isProd = process.env.NODE_ENV === 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p: string) => path.resolve(__dirname, p);

/**
 * Express server for SSR (Development and Production)
 * 
 * This server handles:
 * - Development: Uses Vite middleware for HMR and on-the-fly module loading
 * - Production: Serves pre-built static assets and uses compiled SSR bundle
 * - SSR rendering: Renders React app to HTML for all routes
 * 
 * In production on Vercel, this is deployed as a serverless function.
 */
const app: Express = express();

// Enable compression for all responses
app.use(compression());

// In production, serve client assets from dist/client
// Note: Vercel will handle static files from public/ folder automatically
if (isProd) {
  app.use('/', express.static(resolve('dist/client'), { index: false }));
}

// Initialize Vite dev server in development mode
// Using an async function to initialize Vite server before setting up routes
let vite: ViteDevServer | null = null;

async function initializeVite() {
  if (!isProd) {
    const viteModule = await import('vite');
    vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    // Use Vite's connect instance as middleware (must be before route handlers)
    app.use(vite.middlewares);
  }
}

// Initialize Vite before setting up routes
await initializeVite();

/**
 * Handle all routes with SSR
 * 
 * This catch-all route:
 * - In dev: Uses Vite dev server for HMR and loads modules on-the-fly
 * - In prod: Uses pre-built SSR bundle and static assets
 * - Renders the React app to HTML and injects it into the template
 */
app.get('*', async (req: Request, res: Response) => {
  try {
    const url = req.originalUrl;
    let template: string;
    let appHtml: string;

    if (!isProd && vite) {
      // Development mode: Use Vite dev server
      // Read index.html template
      template = readFileSync(resolve('index.html'), 'utf-8');
      
      // Transform index.html with Vite (injects dev scripts and links)
      template = await vite.transformIndexHtml(url, template);
      
      // Load the server entry module on-the-fly (with HMR support)
      const { render: devRender } = await vite.ssrLoadModule('/src/entry-server.tsx');
      
      // Create a Request object for the render function
      const request = new Request(`http://localhost:${process.env.PORT || 3000}${url}`);
      
      // Render the app - returns HTML string (includes HeadContent and Scripts)
      appHtml = await devRender({ request });
    } else {
      // Production mode: Use pre-built assets
      // Read the pre-built index.html template
      template = readFileSync(resolve('dist/client/index.html'), 'utf-8');
      
      // Import the pre-built SSR render function
      // Note: This file is generated during build (npm run build:server)
      const { render } = await import('./dist/server/entry-server.js');
      
      // Create a Request object for the render function
      const request = new Request(`http://localhost:${process.env.PORT || 3000}${url}`);
      
      // Render the app - returns HTML string (includes HeadContent and Scripts)
      appHtml = await render({ request });
    }

    // Replace the <!--app-html--> placeholder with the rendered app HTML
    // The appHtml includes:
    // - HeadContent (injected by HeadContent component)
    // - App content
    // - Scripts (injected by Scripts component with hydration data)
    const finalHtml = template.replace(`<!--app-html-->`, appHtml);

    // Send the final HTML
    res.status(200).set({ 'Content-Type': 'text/html' }).send(finalHtml);
  } catch (error) {
    // Log error for debugging
    console.error('Error during SSR:', error);
    
    // Return error response
    const errorMessage = error instanceof Error ? error.stack : String(error);
    res.status(500).send(`
      <html>
        <head><title>Server Error</title></head>
        <body>
          <h1>Server Error</h1>
          <pre>${errorMessage}</pre>
        </body>
      </html>
    `);
  }
});

// Start the server in development mode
// In production (Vercel), the app is exported and Vercel handles the server
const port = process.env.PORT || 3000;
if (!isProd) {
  app.listen(port, () => {
    console.log(`🚀 Dev SSR server running at http://localhost:${port}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export the Express app for Vercel
// Vercel will detect this default export and deploy it as a serverless function
export default app;

