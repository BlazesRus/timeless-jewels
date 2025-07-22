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

// wasmUrl is already a resolved string path you can ship to the client
export const load: LayoutLoad = async () => {
  // Only initialize WASI data service in browser environment
  if (!browser) {
    console.log('🏢 SSR: Skipping WASI data service initialization (browser-only)');
    return {
      wasiDataInitialized: false,
      isSSR: true
    };
  }

  console.log('🚀 Client: Layout loading - initializing WASI data service...');

  try {
    // Dynamic import to ensure this only runs in browser
    const { initializeTimelessJewelsData } = await import('$lib/services/wasiDataService.svelte.ts');
    
    // Initialize the WASI data service (this handles all WASM loading and data extraction internally)
    const data = await initializeTimelessJewelsData();

    console.log('✅ WASI data service initialized successfully');

    // The WASI data service now manages all data internally - no need to extract or store anything here
    // Data will be accessed through getTimelessJewelsData() in components that need it
    return {
      wasiDataInitialized: true,
      isSSR: false
    };
  } catch (error) {
    console.error('❌ Failed to initialize WASI data service:', error);
    // Don't throw during client-side initialization, let components handle graceful degradation
    return {
      wasiDataInitialized: false,
      isSSR: false,
      error: String(error)
    };
  }
};
