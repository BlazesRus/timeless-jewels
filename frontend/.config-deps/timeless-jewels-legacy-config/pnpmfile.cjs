// Legacy (Svelte 4) configuration hooks for Timeless Jewels Generator
function readPackage(pkg) {
  // Apply Legacy (Svelte 4) dependency versions
  if (pkg.name === "frontend") {
    console.log("🔧 Applying Legacy (Svelte 4) dependency configuration...");
    
    // Core Svelte 4 dependencies
    if (pkg.devDependencies) {
      // Force Svelte 4.x
      if (pkg.devDependencies["svelte"]) {
        pkg.devDependencies["svelte"] = "^4.2.19";
      }
      
      // SvelteKit v1 for Svelte 4 compatibility
      if (pkg.devDependencies["@sveltejs/kit"]) {
        pkg.devDependencies["@sveltejs/kit"] = "^1.30.4";
      }
      
      // Vite plugin for Svelte 4
      if (pkg.devDependencies["@sveltejs/vite-plugin-svelte"]) {
        pkg.devDependencies["@sveltejs/vite-plugin-svelte"] = "^2.5.3";
      }
      
      // Adapter static v1 for Svelte 4
      if (pkg.devDependencies["@sveltejs/adapter-static"]) {
        pkg.devDependencies["@sveltejs/adapter-static"] = "^2.0.3";
      }
      
      // svelte-check compatible with Svelte 4
      if (pkg.devDependencies["svelte-check"]) {
        pkg.devDependencies["svelte-check"] = "^3.8.6";
      }
      
      // Remove Svelte 5 specific packages
      delete pkg.devDependencies["svelte-canvas"];
      delete pkg.devDependencies["svelte-tiny-virtual-list"];
      
      // Use compatible TypeScript version
      if (pkg.devDependencies["typescript"]) {
        pkg.devDependencies["typescript"] = "^5.5.4";
      }
      
      // Use compatible Vite version
      if (pkg.devDependencies["vite"]) {
        pkg.devDependencies["vite"] = "^4.5.3";
      }
    }
    
    // Update scripts to use Legacy configs
    if (pkg.scripts) {
      if (pkg.scripts["check"]) {
        pkg.scripts["check"] = "svelte-check --tsconfig ./tsconfig.Legacy.json";
      }
      if (pkg.scripts["check:watch"]) {
        pkg.scripts["check:watch"] = "svelte-check --tsconfig ./tsconfig.Legacy.json --watch";
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
