/**
 * JSON Exception Analysis Guide
 *
 * Based on the search results, here are the most likely sources of the two JSON exceptions:
 */

console.log('🔍 JSON Exception Analysis - Likely Sources:');
console.log('');

const likelySources = [
  {
    file: 'frontend/src/routes-modern/+layout.ts',
    line: 63,
    likelihood: 'HIGH',
    reason: 'Safe JSON parsing wrapper - if this fails, the input is definitely malformed',
    code: 'return JSON.parse(jsonStr);',
    context: 'This is in a safe parsing function, so it handles bad JSON gracefully'
  },
  {
    file: 'frontend/src/routes-modern/tree/+page.svelte',
    line: 39,
    likelihood: 'HIGH',
    reason: 'Parsing possibleStatsJSON from WASM - could be timing or data issue',
    code: 'return JSON.parse(possibleStatsJSON as string);',
    context: 'WASM data parsing - might be called before data is ready'
  },
  {
    file: 'frontend/src/lib/skill_tree_modern.ts',
    line: 29,
    likelihood: 'MEDIUM',
    reason: 'Parsing SkillTree data from WASM',
    code: 'skillTree = JSON.parse(dataValue.SkillTree);',
    context: 'WASM SkillTree parsing'
  },
  {
    file: 'frontend/src/lib/skill_tree_modern.ts',
    line: 151,
    likelihood: 'MEDIUM',
    reason: 'Parsing translation files',
    code: 'const translations: TranslationFile = JSON.parse(f);',
    context: 'Translation file parsing'
  },
  {
    file: 'frontend/src/lib/utils/modern-utilities.ts',
    line: 192,
    likelihood: 'LOW',
    reason: 'localStorage parsing with error handling',
    code: 'storedValue = JSON.parse(item);',
    context: 'localStorage with try/catch already in place'
  },
  {
    file: 'frontend/src/lib/services/wasiDataService.svelte.ts',
    line: 237,
    likelihood: 'HIGH',
    reason: 'WASI data service parsing - core functionality',
    code: 'return JSON.parse(jsonString);',
    context: 'Main WASI data parsing'
  },
  {
    file: 'frontend/src/lib/services/wasiDataService.svelte.ts',
    line: 260,
    likelihood: 'HIGH',
    reason: 'WASI data service safe parsing',
    code: 'return JSON.parse(jsonStr);',
    context: 'Safe parsing wrapper in WASI service'
  },
  {
    file: 'frontend/src/lib/components/Modern/SearchComponent.svelte',
    line: 56,
    likelihood: 'MEDIUM',
    reason: 'Search API response parsing',
    code: 'const results = await response.json();',
    context: 'HTTP response parsing'
  }
];

likelySources.forEach((source, i) => {
  console.log(`${i + 1}. ${source.file}:${source.line} [${source.likelihood} likelihood]`);
  console.log(`   Reason: ${source.reason}`);
  console.log(`   Code: ${source.code}`);
  console.log(`   Context: ${source.context}`);
  console.log('');
});

console.log('🎯 Top Suspects for the Two Exceptions:');
console.log('1. WASI data service calls (lines 237, 260) - timing/initialization issues');
console.log('2. Tree page possibleStats parsing (line 39) - WASM data not ready');
console.log('3. Layout safe parsing (line 63) - malformed session/storage data');
console.log('');

console.log('🔧 Debugging Strategy:');
console.log('1. Run the app with enhanced instrumentation in hooks.client.ts');
console.log('2. Check console for "JSON.parse #X FAILED" messages with stack traces');
console.log('3. Look for timing issues (parsing before WASM is ready)');
console.log('4. Check for malformed stored data (sessionStorage/localStorage)');
console.log('5. Verify WASM return values are valid JSON strings');
console.log('');

console.log('🛠️ Available Debug Tools:');
console.log('• window.showJsonStats() - view all parse attempts and failures');
console.log('• window.debugJsonParse(text) - manually test JSON parsing');
console.log('• window.jsonParseFailures - array of all failures with stacks');
console.log('• F12 → Sources → ☑ Pause on exceptions');

export {};
