// Root layout configuration for hybrid static/SPA mode
// - Static pages (home) use SSR for better SEO and performance
// - Dynamic pages (tree routes) use CSR for client-side routing

import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';

export const prerender = true; // Generate static files (index.html, 404.html, etc.)
export const ssr = true; // Enable SSR for static pages (overridden by individual routes)
export const trailingSlash = 'ignore'; // Handle both /path and /path/ gracefully

// Enable client-side rendering for SPA functionality
export const csr = true;

export const load: LayoutLoad = async () => {
  // Only initialize WASI data service in browser environment
  if (!browser) {
    console.log('🏢 SSR: Skipping WASI data service initialization (browser-only)');
    return {
      isSSR: true
    };
  }
};
