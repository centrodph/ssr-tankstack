import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Vite configuration for SSR with TanStack Router and Tailwind CSS
 * 
 * This configuration:
 * - Enables file-based routing with TanStack Router plugin
 * - Configures React plugin for JSX transformation
 * - Sets up Tailwind CSS v4 with Vite plugin
 * - Configures SSR build output to dist/client
 * - Generates SSR manifest for asset mapping
 */
export default defineConfig({
  plugins: [
    // TanStack Router plugin (enable file-based routing with code splitting)
    // This plugin scans src/routes/ and generates src/routeTree.gen.ts automatically
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    // React plugin for JSX transformation and Fast Refresh
    react(),
    // Tailwind CSS v4 plugin (automatic content detection, zero config)
    tailwindcss()
  ],
  build: {
    // Generate SSR manifest for identifying assets in SSR
    // This helps map modules to asset files for proper script injection
    ssrManifest: true,
    // Client build output directory
    outDir: 'dist/client',
    rollupOptions: {
      // Ensure Vite processes index.html for client build
      input: 'index.html'
    }
  }
});

