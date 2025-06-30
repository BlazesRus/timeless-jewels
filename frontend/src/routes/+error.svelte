<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
</script>

<svelte:head>
  <title>Page Not Found - Timeless Jewel Calculator</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-orange-500 mb-4">404</h1>
    <h2 class="text-2xl font-semibold mb-4">Page Not Found</h2>
    <p class="text-gray-300 mb-8">
      The page "{$page.url.pathname}" could not be found.
    </p>
    
    <div class="space-y-4">
      <a 
        href="{base}/" 
        class="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
      >
        Go to Home
      </a>
      
      <div class="text-sm text-gray-400">
        <p>Available pages:</p>
        <ul class="mt-2 space-y-1">
          <li><a href="{base}/" class="text-orange-400 hover:text-orange-300">Home (Calculator)</a></li>
          <li><a href="{base}/tree" class="text-orange-400 hover:text-orange-300">Skill Tree View</a></li>
        </ul>
      </div>
    </div>
  </div>
</div>
