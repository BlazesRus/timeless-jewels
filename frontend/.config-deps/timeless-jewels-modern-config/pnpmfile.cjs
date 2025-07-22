// Modern (Svelte 5) configuration hooks for Timeless Jewels Generator  
function readPackage(pkg) {
  // Apply Modern (Svelte 5) dependency versions
  if (pkg.name === "frontend") {
    console.log("🚀 Applying Modern (Svelte 5) dependency configuration...");
    
    // Core Svelte 5 dependencies (latest versions)
    if (pkg.devDependencies) {
      // Core Svelte 5 stack - updated for latest
      if (pkg.devDependencies["svelte"]) {
        pkg.devDependencies["svelte"] = "^5.34.8";
      }
      if (pkg.devDependencies["@sveltejs/kit"]) {
        pkg.devDependencies["@sveltejs/kit"] = "^2.22.2";
      }
      if (pkg.devDependencies["@sveltejs/vite-plugin-svelte"]) {
        pkg.devDependencies["@sveltejs/vite-plugin-svelte"] = "^5.1.0";
      }
      if (pkg.devDependencies["@sveltejs/adapter-static"]) {
        pkg.devDependencies["@sveltejs/adapter-static"] = "^3.0.8";
      }
      if (pkg.devDependencies["@sveltejs/vite-plugin-svelte-inspector"]) {
        pkg.devDependencies["@sveltejs/vite-plugin-svelte-inspector"] = "^4.0.1";
      }
      if (pkg.devDependencies["svelte-check"]) {
        pkg.devDependencies["svelte-check"] = "^4.2.1";
      }
      if (pkg.devDependencies["svelte-eslint-parser"]) {
        pkg.devDependencies["svelte-eslint-parser"] = "^1.2.0";
      }
      
      // Vite 7 optimizations
      if (pkg.devDependencies["vite"]) {
        pkg.devDependencies["vite"] = "^7.0.0";
      }
      
      // Add modern development packages for Svelte 5 + Vite 7
      pkg.devDependencies["@vite/plugin-node-polyfills"] = "^0.24.0";
      pkg.devDependencies["vite-plugin-svelte-console-remover"] = "^2.1.0";
      pkg.devDependencies["vite-plugin-top-level-await"] = "^1.4.1";
      pkg.devDependencies["@vitest/ui"] = "^2.1.8";
      pkg.devDependencies["vitest"] = "^2.1.8";
      
      // Svelte 5 specific modern components
      if (pkg.devDependencies["svelte-canvas"]) {
        pkg.devDependencies["svelte-canvas"] = "^2.0.2";
      }
      if (pkg.devDependencies["svelte-tiny-virtual-list"]) {
        pkg.devDependencies["svelte-tiny-virtual-list"] = "^2.0.6";
      }
      
      // Remove packages that are no longer needed in modern mode or keep svelte-preprocess for Modern mode for preprocessing
      delete pkg.devDependencies["svelte-preprocess"]; // Not needed with SvelteKit 2.0+
			
      //if (pkg.devDependencies["svelte-preprocess"]) {
      //  pkg.devDependencies["svelte-preprocess"] = "^6.0.3";
      //}
      
      // ESLint ecosystem for Modern
      if (pkg.devDependencies["@eslint/js"]) {
        pkg.devDependencies["@eslint/js"] = "^9.28.0";
      }      
      if (pkg.devDependencies["@eslint/css"]) {
        pkg.devDependencies["@eslint/css"] = "^0.9.0";
      }
      if (pkg.devDependencies["@sveltejs/eslint-config"]) {
        pkg.devDependencies["@sveltejs/eslint-config"] = "^8.2.0";
      }
      if (pkg.devDependencies["eslint"]) {
        pkg.devDependencies["eslint"] = "^9.28.0";
      }
      if (pkg.devDependencies["eslint-plugin-svelte"]) {
        pkg.devDependencies["eslint-plugin-svelte"] = "^3.9.1";
      }
      if (pkg.devDependencies["eslint-config-prettier"]) {
        pkg.devDependencies["eslint-config-prettier"] = "^10.1.5";
      }
      if (pkg.devDependencies["eslint-plugin-prettier"]) {
        pkg.devDependencies["eslint-plugin-prettier"] = "^5.4.1";
      }
      
      // TypeScript ecosystem for Modern
      if (pkg.devDependencies["typescript"]) {
        pkg.devDependencies["typescript"] = "^5.8.3";
      }
      if (pkg.devDependencies["@typescript-eslint/eslint-plugin"]) {
        pkg.devDependencies["@typescript-eslint/eslint-plugin"] = "^8.33.1";
      }
      if (pkg.devDependencies["@typescript-eslint/parser"]) {
        pkg.devDependencies["@typescript-eslint/parser"] = "^8.33.1";
      }
      if (pkg.devDependencies["typescript-eslint"]) {
        pkg.devDependencies["typescript-eslint"] = "^8.33.1";
      }
      if (pkg.devDependencies["tslib"]) {
        pkg.devDependencies["tslib"] = "^2.6.3";
      }
      if (pkg.devDependencies["@types/node"]) {
        pkg.devDependencies["@types/node"] = "^24.0.4";
      }
      
      // Tailwind CSS v4+ ecosystem for Modern
      if (pkg.devDependencies["tailwindcss"]) {
        pkg.devDependencies["tailwindcss"] = "^4.1.8";
      }
      if (pkg.devDependencies["@tailwindcss/postcss"]) {
        pkg.devDependencies["@tailwindcss/postcss"] = "^4.1.8";
      }
      if (pkg.devDependencies["postcss"]) {
        pkg.devDependencies["postcss"] = "^8.4.38";
      }
      if (pkg.devDependencies["postcss-html"]) {
        pkg.devDependencies["postcss-html"] = "^1.8.0";
      }
      if (pkg.devDependencies["postcss-import"]) {
        pkg.devDependencies["postcss-import"] = "^16.1.0";
      }
      if (pkg.devDependencies["autoprefixer"]) {
        pkg.devDependencies["autoprefixer"] = "^10.4.16";
      }
      
      // Styling and linting for Modern
      if (pkg.devDependencies["stylelint"]) {
        pkg.devDependencies["stylelint"] = "^16.21.0";
      }
      if (pkg.devDependencies["stylelint-config-standard"]) {
        pkg.devDependencies["stylelint-config-standard"] = "^38.0.0";
      }
      if (pkg.devDependencies["stylelint-config-tailwindcss"]) {
        pkg.devDependencies["stylelint-config-tailwindcss"] = "^1.0.0";
      }
      if (pkg.devDependencies["prettier"]) {
        pkg.devDependencies["prettier"] = "^3.5.3";
      }
      if (pkg.devDependencies["prettier-plugin-svelte"]) {
        pkg.devDependencies["prettier-plugin-svelte"] = "^3.4.0";
      }
      if (pkg.devDependencies["sass"]) {
        pkg.devDependencies["sass"] = "^1.77.4";
      }
        // Build tools and utilities for Modern
      if (pkg.devDependencies["vite"]) {
        pkg.devDependencies["vite"] = "^7.0.0";
      }
      if (pkg.devDependencies["comlink"]) {
        pkg.devDependencies["comlink"] = "^4.4.2";
      }
      if (pkg.devDependencies["globals"]) {
        pkg.devDependencies["globals"] = "^16.2.0";
      }
      if (pkg.devDependencies["cross-env"]) {
        pkg.devDependencies["cross-env"] = "^7.0.3";
      }
      
      // ESLint CSS support with Tailwind
      if (pkg.devDependencies["@eslint/css"]) {
        pkg.devDependencies["@eslint/css"] = "^0.9.0";
      }
      if (pkg.devDependencies["tailwind-csstree"]) {
        pkg.devDependencies["tailwind-csstree"] = "^0.1.1";
      }
      if(pkg.devDependencies["vite-plugin-wasm"]) {
			  pkg.devDependencies["vite-plugin-wasm" = ""^3.4.1";
			}
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
