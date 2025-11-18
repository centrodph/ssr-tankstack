import { hydrateRoot } from 'react-dom/client';
import { RouterClient } from '@tanstack/react-router/ssr/client';
import { getRouter } from './router';

/**
 * Client-side entry point for hydration
 * 
 * Following TanStack Router's official SSR pattern:
 * - Creates a router instance (using browser history)
 * - Hydrates the React app into the existing server-rendered HTML
 * - Consumes dehydrated data (route loaders + Query cache) from hydration scripts
 * - Makes the page interactive with event handlers
 * 
 * After hydration, client-side navigation can occur without full page reloads.
 */
const router = getRouter();

// Hydrate the React app into the existing DOM
// hydrateRoot attaches event handlers to server-generated HTML
// RouterClient component bootstraps the router and handles hydration
// The Scripts component in __root.tsx injects hydration data that RouterClient reads
hydrateRoot(document.getElementById('root')!, <RouterClient router={router} />);

