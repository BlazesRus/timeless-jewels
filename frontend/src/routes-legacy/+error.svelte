<!-- Basic Error Page
 * Copyright (C) 2025 James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot assistance
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE. 
-->
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
      <a href="{base}/" class="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors">Go to Home</a>

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
