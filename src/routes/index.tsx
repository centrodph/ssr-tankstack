import { createFileRoute } from '@tanstack/react-router';

/**
 * Home page route component
 * 
 * This route corresponds to the "/" path.
 * The router plugin treats index.tsx as the default child route of its parent.
 * 
 * This is a simple welcome page demonstrating basic routing.
 */
export const Route = createFileRoute('/')({
  component: function HomePage() {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to the SSR React App!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          This is a server-side rendered React application built with:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>React 18 with TypeScript</li>
          <li>TanStack Router for type-safe routing</li>
          <li>TanStack Query for data fetching and caching</li>
          <li>Tailwind CSS for styling</li>
          <li>Vite for fast development and building</li>
        </ul>
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Try it out:</strong> Navigate to{' '}
            <a 
              href="/repos/tanstack" 
              className="text-blue-600 hover:underline font-semibold"
            >
              /repos/tanstack
            </a>{' '}
            to see server-side data fetching in action!
          </p>
        </div>
      </div>
    );
  },
});

