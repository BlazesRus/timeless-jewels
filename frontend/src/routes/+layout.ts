// Root layout configuration for hybrid static/SPA mode
// - Static pages (home) use SSR for better SEO and performance
// - Dynamic pages (tree routes) use CSR for client-side routing

export const prerender = true;  // Generate static files (index.html, 404.html, etc.)
export const ssr = true;        // Enable SSR for static pages (overridden by individual routes)
export const trailingSlash = 'ignore'; // Handle both /path and /path/ gracefully

// Enable client-side rendering for SPA functionality
export const csr = true;
