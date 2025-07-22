// Root layout configuration for hybrid static/SPA mode
// - Static pages (home) use SSR for better SEO and performance
// - Dynamic pages (tree routes) use CSR for client-side routing

import type { LayoutLoad } from './$types';
import { initializeTimelessJewelsData } from '$lib/services/wasiDataService.svelte.ts';

export const prerender = true; // Generate static files (index.html, 404.html, etc.)
export const ssr = true; // Enable SSR for static pages (overridden by individual routes)
export const trailingSlash = 'ignore'; // Handle both /path and /path/ gracefully

// Enable client-side rendering for SPA functionality
export const csr = true;

// wasmUrl is already a resolved string path you can ship to the client
export const load: LayoutLoad = async () => {
  console.log('🚀 Layout loading - initializing WASI data service...');

  try {
    // Initialize the WASI data service (this handles all WASM loading and data extraction internally)
    const data = await initializeTimelessJewelsData();

    console.log('✅ WASI data service initialized successfully');

    // The WASI data service now manages all data internally - no need to extract or store anything here
    // Data will be accessed through getTimelessJewelsData() in components that need it
    return {
      wasiDataInitialized: true
    };
  } catch (error) {
    console.error('❌ Failed to initialize WASI data service:', error);
    throw new Error(`WASI data service initialization failed: ${error}`);
  }
};
