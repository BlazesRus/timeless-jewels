// Root layout configuration for hybrid static/SPA mode
// - Static pages (home) use SSR for better SEO and performance
// - Dynamic pages (tree routes) use CSR for client-side routing

export const trailingSlash = 'ignore'; // Handle both /path and /path/ gracefully
