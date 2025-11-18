import { 
  Outlet, 
  createRootRoute, 
  Link,
  HeadContent,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

/**
 * Root layout route component
 * 
 * This is the top-level layout that wraps all other routes.
 * By convention, __root.tsx defines the root layout (similar to Next.js app layout).
 * 
 * Following TanStack Router's official SSR pattern:
 * - Uses HeadContent to inject head tags (meta, title, etc.)
 * - Uses Scripts to inject hydration scripts
 * - Provides global layout markup (header, footer, main content area)
 * - Navigation links for client-side routing
 * - Outlet for rendering nested route content
 * - Optional devtools for development
 */
export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: 'SSR TanStack App',
      },
      {
        name: 'description',
        content: 'SSR React app with TanStack Router and TanStack Query',
      },
    ],
  }),
  component: function RootLayout() {
    return (
      <>
        {/* HeadContent injects head tags (title, meta, etc.) */}
        <HeadContent />
        
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Header with navigation */}
          <header className="bg-blue-600 text-white shadow-md">
            <nav className="container mx-auto px-4 py-4">
              <div className="flex space-x-6">
                <Link 
                  to="/" 
                  className="font-bold text-lg hover:text-blue-200 transition-colors"
                  activeProps={{ className: 'underline' }}
                >
                  Home
                </Link>
                <Link 
                  to="/repos/tanstack" 
                  className="font-bold text-lg hover:text-blue-200 transition-colors"
                  activeProps={{ className: 'underline' }}
                >
                  TanStack Repos
                </Link>
              </div>
            </nav>
          </header>

          {/* Main content area - nested routes render here */}
          <main className="flex-1 container mx-auto px-4 py-8">
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-white py-4 mt-auto">
            <div className="container mx-auto px-4 text-center text-sm">
              <p>SSR React App with TanStack Router & Query</p>
            </div>
          </footer>

          {/* TanStack Router Devtools - only visible in development */}
          {process.env.NODE_ENV === 'development' && (
            <TanStackRouterDevtools position="bottom-right" />
          )}
        </div>
        
        {/* Scripts injects hydration scripts for SSR */}
        <Scripts />
      </>
    );
  },
});

