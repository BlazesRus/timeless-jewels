<!-- src/routes-modern/about/+page.svelte -->
<script context="module" lang="ts">
  // prerender this page at build time
  export const prerender = true;
</script>

<script lang="ts">
  // No props or load data needed for static About page
</script>

<svelte:head>
  <title>About | Timeless Jewels</title>
  <meta
    name="description"
    content="Timeless Jewels is a Path of Exile jewel calculator built with Svelte 5, featuring a passive skill tree view, PWA support, and optional desktop packaging via Electron."
  />
</svelte:head>

<main class="prose mx-auto py-8">
  <h1>About Timeless Jewels</h1>

  <p>
    Timeless Jewels is a modern Path of Exile jewel calculator and passive skill
    tree visualizer, reimplemented in Svelte 5 with strict TypeScript and
    Tailwind CSS. It delivers a fast, offline-capable experience and can
    optionally be packaged as a desktop app via Electron.
  </p>

  <h2>Key Features</h2>
  <ul>
    <li>
      Svelte 5 Strict Mode: Fully typed components and rigorous compile-time
      checks.
    </li>
    <li>
      Passive Skill Tree View: Interactive tree display to help you plan your
      timeless jewel placements.
    </li>
    <li>
      Enhanced Trade Search: Splits queries into batches for reliable,
      high-volume searches.
    </li>
    <li>
      PWA &amp; WASM: Offline support via VitePWA and WebAssembly-powered
      calculators for blazing performance.
    </li>
    <li>
      Electron Packaging: One-click builds for Windows, macOS, and Linux.
    </li>
  </ul>

  <h2>Quick Links</h2>
  <ul>
    <li>
      <a
        href="https://blazesrus.github.io/timeless-jewels"
        target="_blank"
        rel="noopener"
        >Live Demo on GitHub Pages</a
      >
    </li>
    <li>
      <a
        href="https://github.com/BlazesRus/timeless-jewels"
        target="_blank"
        rel="noopener"
        >Source Repository</a
      >
    </li>
    <li>
      <a
        href="https://github.com/Vilsol/go-pob-data"
        target="_blank"
        rel="noopener"
        >Game Data Extraction (go-pob-data)</a
      >
    </li>
  </ul>

  <h2>License</h2>
  <p>
    The core code is licensed under GPL-3.0-only. Select components and scripts
    are available under MIT, MIT-0, or BSD-3-Clause. See
    <a href="/LICENSE-EXCEPTIONS.md">LICENSE-EXCEPTIONS.md</a> for full details.
  </p>
</main>
