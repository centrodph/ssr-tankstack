import { renderToString } from 'react-dom/server';
import { createRequestHandler } from '@tanstack/react-router/ssr/server';
import { RouterServer } from '@tanstack/react-router/ssr/server';
import { getRouter } from './router';

/**
 * Server-side rendering entry point
 * 
 * Following TanStack Router's official SSR pattern from basic-ssr-file-based example:
 * - Uses createRequestHandler to properly initialize router for SSR
 * - Creates a router instance for the request
 * - Loads the route and resolves all loaders (including data prefetching)
 * - Renders the app to HTML string using renderToString
 * - Returns the HTML string (hydration scripts are injected via <Scripts> component)
 * 
 * @param {Object} options - Render options
 * @param {Request} options.request - The incoming HTTP request
 * @returns {Promise<string>} HTML string containing the rendered app
 */
export async function render({ request }: { request: Request }): Promise<string> {
  try {
    // Create a request handler that properly initializes the router for SSR
    // This ensures the router's internal store is set up correctly
    const handler = createRequestHandler({
      request,
      createRouter: getRouter,
    });
    
    // Use a custom render handler that uses renderToString with RouterServer
    const response = await handler(async (opts) => {
      // The router is already initialized and loaded by createRequestHandler
      const router = opts.router;
      
      // Render the app to HTML string
      // RouterServer component handles SSR rendering
      // Scripts component (in __root.tsx) will inject hydration data
      const html = renderToString(<RouterServer router={router} />);
      
      // Return as Response with HTML content
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    });
    
    // Extract HTML string from Response
    const html = await response.text();
    return html;
  } catch (error) {
    // Log error for debugging
    console.error('Error during SSR render:', error);
    
    // Return error HTML
    return `<div><h1>Server Error</h1><pre>${error instanceof Error ? error.stack : String(error)}</pre></div>`;
  }
}

