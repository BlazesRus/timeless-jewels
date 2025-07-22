/**
 * Session Storage Cleaner - Run this in your browser console to clear problematic session storage
 *
 * This helps resolve JSON parse errors that can occur when SvelteKit tries to parse
 * corrupted or malformed session storage data.
 *
 * To use:
 * 1. Open your browser's Developer Tools (F12)
 * 2. Go to the Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter to run it
 * 5. Refresh the page
 */

(function clearProblematicSessionStorage() {
  console.log('🧹 Clearing potentially problematic session storage...');

  let clearedCount = 0;
  let errorCount = 0;

  // Common keys that might become corrupted
  const keysToCheck = [
    '$page',
    '__sveltekit',
    'sveltekit:scroll',
    'sveltekit:states',
    'sveltekit:navigation'
  ];

  // Check all session storage keys
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      try {
        const value = sessionStorage.getItem(key);
        if (value) {
          // Try to parse the value to see if it's valid JSON
          JSON.parse(value);
        }
      } catch (error) {
        console.warn(`❌ Removing corrupted key: "${key}"`);
        sessionStorage.removeItem(key);
        clearedCount++;
        i--; // Adjust index since we removed an item
      }
    }
  }

  // Also check specific keys that might be problematic
  for (const key of keysToCheck) {
    try {
      const value = sessionStorage.getItem(key);
      if (value) {
        JSON.parse(value);
      }
    } catch (error) {
      console.warn(`❌ Removing known problematic key: "${key}"`);
      sessionStorage.removeItem(key);
      clearedCount++;
    }
  }

  if (clearedCount > 0) {
    console.log(`✅ Cleared ${clearedCount} problematic session storage entries`);
    console.log('🔄 Please refresh the page to see if the errors are resolved');
  } else {
    console.log('✅ No problematic session storage entries found');
  }

  // Show remaining session storage for debugging
  const remainingKeys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) remainingKeys.push(key);
  }

  if (remainingKeys.length > 0) {
    console.log('📋 Remaining session storage keys:', remainingKeys);
  } else {
    console.log('📭 Session storage is now empty');
  }
})();

console.log('');
console.log('🎯 Alternative: Clear ALL session storage');
console.log('If you want to clear everything, run: sessionStorage.clear()');
