// Modern (Svelte 5) configuration hooks for Timeless Jewels Generator  
function readPackage(pkg) {
  // Apply Modern (Svelte 5) dependency versions
  if (pkg.name === "frontend") {
    console.log("🚀 Applying Modern (Svelte 5) dependency configuration...");
    
    // Core Svelte 5 dependencies (current versions)
    if (pkg.devDependencies) {
      // Force Svelte 5.x (latest)
      if (pkg.devDependencies["svelte"]) {
        pkg.devDependencies["svelte"] = "^5.33.18";
      }
      
      // SvelteKit v2 for Svelte 5
      if (pkg.devDependencies["@sveltejs/kit"]) {
        pkg.devDependencies["@sveltejs/kit"] = "^2.21.3";
      }
      
      // Vite plugin for Svelte 5
      if (pkg.devDependencies["@sveltejs/vite-plugin-svelte"]) {
        pkg.devDependencies["@sveltejs/vite-plugin-svelte"] = "^5.1.0";
      }
      
      // Adapter static v3 for Svelte 5
      if (pkg.devDependencies["@sveltejs/adapter-static"]) {
        pkg.devDependencies["@sveltejs/adapter-static"] = "^3.0.8";
      }
      
      // svelte-check compatible with Svelte 5
      if (pkg.devDependencies["svelte-check"]) {
        pkg.devDependencies["svelte-check"] = "^4.2.1";
      }
      
      // Include Svelte 5 specific packages
      pkg.devDependencies["svelte-canvas"] = "^2.0.2";
      pkg.devDependencies["svelte-tiny-virtual-list"] = "^2.0.6";
      
      // Use latest TypeScript
      if (pkg.devDependencies["typescript"]) {
        pkg.devDependencies["typescript"] = "^5.8.3";
      }
      
      // Use latest Vite
      if (pkg.devDependencies["vite"]) {
        pkg.devDependencies["vite"] = "^6.3.5";
      }
      
      // Remove legacy-only dependencies
      delete pkg.devDependencies["svelte-preprocess"];
    }
    
    // Update scripts to use Modern configs
    if (pkg.scripts) {
      if (pkg.scripts["check"]) {
        pkg.scripts["check"] = "svelte-check --tsconfig ./tsconfig.Modern.json";
      }
      if (pkg.scripts["check:watch"]) {
        pkg.scripts["check:watch"] = "svelte-check --tsconfig ./tsconfig.Modern.json --watch";
      }
    }
  }
  
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
