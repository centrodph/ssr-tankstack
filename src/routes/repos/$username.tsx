import { createFileRoute } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

/**
 * GitHub repository interface
 * 
 * Represents a GitHub repository from the API response.
 * Only includes the fields we use in the component.
 */
interface GitHubRepository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}

/**
 * TanStack Query options for fetching user repositories
 * 
 * This query fetches a GitHub user's public repositories.
 * It's used both in the route loader (for SSR prefetching) and
 * in the component (for consuming the cached data).
 * 
 * @param {string} username - GitHub username to fetch repos for
 * @returns {QueryOptions} Query options object
 */
const userReposQuery = (username: string) => queryOptions({
  queryKey: ['githubRepos', username],
  queryFn: async (): Promise<GitHubRepository[]> => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos`);
      
      if (!response.ok) {
        // Handle API errors
        if (response.status === 404) {
          throw new Error(`User "${username}" not found`);
        }
        throw new Error(`Failed to load repos for ${username}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data as GitHubRepository[];
    } catch (error) {
      // Log error for debugging
      console.error(`Error fetching repos for ${username}:`, error);
      throw error;
    }
  },
  // Cache repos for 5 minutes to avoid excessive API calls
  staleTime: 1000 * 60 * 5,
});

/**
 * Dynamic route for displaying GitHub user repositories
 * 
 * This route handles paths like /repos/:username.
 * The $username.tsx file name convention tells TanStack Router
 * that this is a dynamic segment called "username" in the URL.
 * 
 * The route uses:
 * - A loader to prefetch data on the server (SSR)
 * - useSuspenseQuery to consume the cached data in the component
 * 
 * This pattern ensures:
 * - No loading spinners on initial SSR (data is prefetched)
 * - Seamless hydration (data is already in cache)
 * - No unnecessary refetches on client navigation
 */
export const Route = createFileRoute('/repos/$username')({
  /**
   * Route loader - prefetches data on the server
   * 
   * This function runs on the server before rendering.
   * It ensures the query data is in the cache, so when the component
   * renders, the data is already available (no loading state).
   * 
   * The data is automatically dehydrated and sent to the client,
   * where it's rehydrated into the Query cache.
   */
  loader: async ({ params, context }) => {
    const { username } = params;
    
    // Ensure query data is fetched and cached
    // This will wait for the fetch to complete before rendering
    return context.queryClient.ensureQueryData(userReposQuery(username));
  },
  
  /**
   * Route component - displays the repositories
   * 
   * Uses useSuspenseQuery to read the cached data.
   * Since the loader has already ensured the data is in cache,
   * this will return immediately without refetching.
   */
  component: function ReposPage() {
    // Get the username parameter from the URL
    const { username } = Route.useParams();
    
    // Use Suspense query hook to read cached data
    // This will not refetch on the client if cache is hydrated from server
    const { data: repos } = useSuspenseQuery(userReposQuery(username));
    
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Repositories of {username}
        </h2>
        <p className="text-gray-600 mb-6">
          Showing {repos.length} {repos.length === 1 ? 'repository' : 'repositories'}
        </p>
        
        {repos.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-900">
              No public repositories found for this user.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {repos.map((repo) => (
              <li 
                key={repo.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg"
                    >
                      {repo.name}
                    </a>
                    {repo.description && (
                      <p className="text-gray-700 mt-1">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        ⭐ {repo.stargazers_count}
                      </span>
                      <span>
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
});

