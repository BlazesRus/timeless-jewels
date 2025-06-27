// Legacy (Svelte 4) configuration hooks for Timeless Jewels Generator
// Uses Tailwind CSS v4 (same as modern mode) for consistency
function readPackage(pkg) {
  // Apply Legacy (Svelte 4) dependency versions
  if (pkg.name === "frontend") {
    console.log("🔧 Applying Legacy (Svelte 4) dependency configuration...");
    
    // Core Svelte 4 dependencies
    if (pkg.devDependencies) {
      // Core Svelte ecosystem - Legacy versions
      if (pkg.devDependencies["svelte"]) {
        pkg.devDependencies["svelte"] = "^4.2.17";
      }
      if (pkg.devDependencies["@sveltejs/kit"]) {
        pkg.devDependencies["@sveltejs/kit"] = "^2.0.0";
      }
      if (pkg.devDependencies["@sveltejs/vite-plugin-svelte"]) {
        pkg.devDependencies["@sveltejs/vite-plugin-svelte"] = "^5.1.0";
      }
      if (pkg.devDependencies["@sveltejs/adapter-static"]) {
        pkg.devDependencies["@sveltejs/adapter-static"] = "^3.0.0";
      }
      if (pkg.devDependencies["@sveltejs/vite-plugin-svelte-inspector"]) {
        pkg.devDependencies["@sveltejs/vite-plugin-svelte-inspector"] = "^2.0.0";
      }
      if (pkg.devDependencies["@sveltejs/eslint-config"]) {
        pkg.devDependencies["@sveltejs/eslint-config"] = "^8.2.0";
      }
      if (pkg.devDependencies["svelte-check"]) {
        pkg.devDependencies["svelte-check"] = "^3.6.0";
      }
      if (pkg.devDependencies["svelte-eslint-parser"]) {
        pkg.devDependencies["svelte-eslint-parser"] = "^1.2.0";
      }
      if (pkg.devDependencies["svelte-preprocess"]) {
        pkg.devDependencies["svelte-preprocess"] = "^5.1.3";
      }
      
      // ESLint ecosystem - Legacy compatible versions
      if (pkg.devDependencies["@eslint/js"]) {
        pkg.devDependencies["@eslint/js"] = "^8.56.0";
      }      if (pkg.devDependencies["@eslint/migrate-config"]) {
        pkg.devDependencies["@eslint/migrate-config"] = "^1.5.0";
      }
      if (pkg.devDependencies["@eslint/css"]) {
        pkg.devDependencies["@eslint/css"] = "^0.9.0";
      }
      if (pkg.devDependencies["eslint"]) {
        pkg.devDependencies["eslint"] = "^8.57.0";
      }
      if (pkg.devDependencies["eslint-config-prettier"]) {
        pkg.devDependencies["eslint-config-prettier"] = "^9.1.0";
      }
      if (pkg.devDependencies["eslint-plugin-prettier"]) {
        pkg.devDependencies["eslint-plugin-prettier"] = "^5.1.3";
      }
      if (pkg.devDependencies["eslint-plugin-svelte"]) {
        pkg.devDependencies["eslint-plugin-svelte"] = "^2.35.1";
      }
      
      // TypeScript ecosystem - Legacy versions
      if (pkg.devDependencies["@typescript-eslint/eslint-plugin"]) {
        pkg.devDependencies["@typescript-eslint/eslint-plugin"] = "^6.7.5";
      }
      if (pkg.devDependencies["@typescript-eslint/parser"]) {
        pkg.devDependencies["@typescript-eslint/parser"] = "^6.7.5";
      }
      if (pkg.devDependencies["typescript"]) {
        pkg.devDependencies["typescript"] = "^5.8.3";
      }
      
      // Tailwind ecosystem - Updated to v4 for consistency with modern mode
      if (pkg.devDependencies["@tailwindcss/postcss"]) {
        pkg.devDependencies["@tailwindcss/postcss"] = "^4.1.8";
      }
      if (pkg.devDependencies["@tailwindcss/vite"]) {
        pkg.devDependencies["@tailwindcss/vite"] = "^4.1.11";
      }
      if (pkg.devDependencies["tailwindcss"]) {
        pkg.devDependencies["tailwindcss"] = "^4.1.8";
      }
      if (pkg.devDependencies["autoprefixer"]) {
        pkg.devDependencies["autoprefixer"] = "^10.4.16";
      }
      
      // Stylelint with Tailwind support
      if (pkg.devDependencies["stylelint-config-tailwindcss"]) {
        pkg.devDependencies["stylelint-config-tailwindcss"] = "^1.0.0";
      }
      
      // PostCSS ecosystem
      if (pkg.devDependencies["postcss"]) {
        pkg.devDependencies["postcss"] = "^8.4.38";
      }
      
      // Prettier ecosystem
      if (pkg.devDependencies["prettier"]) {
        pkg.devDependencies["prettier"] = "^3.2.5";
      }
      if (pkg.devDependencies["prettier-plugin-svelte"]) {
        pkg.devDependencies["prettier-plugin-svelte"] = "^3.0.3";
      }
        // Build tools and utilities
      if (pkg.devDependencies["@types/node"]) {
        pkg.devDependencies["@types/node"] = "^22.0.0";
      }
      if (pkg.devDependencies["tslib"]) {
        pkg.devDependencies["tslib"] = "^2.6.2";
      }
      if (pkg.devDependencies["comlink"]) {
        pkg.devDependencies["comlink"] = "^4.4.2";
      }
      if (pkg.devDependencies["sass"]) {
        pkg.devDependencies["sass"] = "^1.69.7";
      }
      if (pkg.devDependencies["globals"]) {
        pkg.devDependencies["globals"] = "^13.24.0";
      }
      if (pkg.devDependencies["vite"]) {
        pkg.devDependencies["vite"] = "^6.0.0";
      }
      
      // ESLint CSS support with Tailwind (Legacy compatible versions)
      if (pkg.devDependencies["@eslint/css"]) {
        pkg.devDependencies["@eslint/css"] = "^0.8.0"; // Earlier version for Legacy
      }
      if (pkg.devDependencies["tailwind-csstree"]) {
        pkg.devDependencies["tailwind-csstree"] = "^0.1.1";
      }
      
      // Svelte specific components - Legacy versions
      if (pkg.devDependencies["svelte-canvas"]) {
        pkg.devDependencies["svelte-canvas"] = "^0.9.3";
      }
      if (pkg.devDependencies["svelte-select"]) {
        pkg.devDependencies["svelte-select"] = "^5.7.0";
      }
      if (pkg.devDependencies["svelte-tiny-virtual-list"]) {
        pkg.devDependencies["svelte-tiny-virtual-list"] = "^2.0.5";
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
