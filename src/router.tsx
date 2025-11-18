import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen'; // Generated routes by TanStack Router plugin
import { QueryClient } from '@tanstack/react-query';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

/**
 * Creates a new router instance with TanStack Query integration
 * 
 * This function is called on both server and client to create router instances.
 * On the server, a new QueryClient is created per request to ensure data isolation.
 * On the client, a single QueryClient is reused for the app lifecycle.
 * 
 * The router is configured with:
 * - QueryClient in context for access in route loaders
 * - Intent-based preloading for performance
 * - SSR Query integration for automatic hydration
 * 
 * @returns {Router} Configured router instance ready for SSR or client-side use
 */
export function getRouter() {
  // Create a new QueryClient instance
  // In SSR, this should be created per request to avoid data leakage
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time to reduce unnecessary refetches
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Retry failed queries once
        retry: 1,
      },
    },
  });

  // Create router with route tree and context
  const router = createRouter({
    routeTree,
    // Make QueryClient accessible in route loaders via context
    context: { queryClient },
    // Preload routes on link hover/focus for snappier navigation
    defaultPreload: 'intent',
    // Scroll restoration is enabled by default in SSR mode
  });

  // Set up SSR Query integration
  // This automates:
  // - Dehydration of Query cache on server
  // - Hydration of Query cache on client
  // - Streaming of queries resolved after initial render
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    // handleRedirects: true (default) - handles redirect() from queries
    // wrapQueryClient: true (default) - auto-wraps router in <QueryClientProvider>
  });

  return router;
}

// Extend TanStack Router's types to include queryClient in context
declare module '@tanstack/react-router' {
  interface RouterContext {
    queryClient: ReturnType<typeof QueryClient>;
  }
}

