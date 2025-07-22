/**
 * 🔥 JSON Exception Hunting Guide
 *
 * Your app now has comprehensive JSON parsing instrumentation.
 * Follow this guide to capture and analyze the two mysterious JSON exceptions.
 */

console.log('🎯 JSON Exception Hunting - Your Action Plan:');
console.log('');

console.log('1️⃣ OPEN THE APP:');
console.log('   • Visit: http://localhost:5173/timeless-jewels');
console.log('   • Open DevTools (F12) immediately');
console.log('   • Go to Console tab');
console.log('   • Clear console (Ctrl+L)');
console.log('');

console.log('2️⃣ ENABLE EXCEPTION BREAKING:');
console.log('   • DevTools → Sources tab');
console.log('   • Right sidebar → Event Listener Breakpoints');
console.log('   • Expand "Exceptions" → ☑ "Thrown"');
console.log('   • This will pause on JSON.parse errors');
console.log('');

console.log('3️⃣ TRIGGER THE EXCEPTIONS:');
console.log('   • Refresh the page (F5)');
console.log('   • Wait for app to fully load');
console.log('   • Navigate to tree view (/timeless-jewels/tree)');
console.log('   • Interact with the app (search, click jewels, etc.)');
console.log('');

console.log('4️⃣ WHAT TO LOOK FOR IN CONSOLE:');
console.log('   🔍 "JSON.parse #X called:" - Every parse attempt');
console.log('   ✅ "JSON.parse #X succeeded" - Successful parses');
console.log('   🔥 "JSON.parse #X FAILED:" - The exceptions we want!');
console.log('   🎯 "Likely caller:" - Shows which code triggered it');
console.log('   🌐 "Fetch #X called:" - Network requests');
console.log('   📄 "response.json() #X" - API response parsing');
console.log('');

console.log('5️⃣ WHEN EXCEPTIONS OCCUR:');
console.log('   • Note the parse attempt number (#X)');
console.log('   • Look at the "Likely caller" line');
console.log('   • Check the stack trace in the failure log');
console.log('   • If DevTools paused, examine the Variables panel');
console.log('   • Copy the raw text that failed to parse');
console.log('');

console.log('6️⃣ ANALYSIS TOOLS (Run in Console):');
console.log('   window.showJsonStats()          - Summary of all attempts');
console.log('   window.jsonParseFailures        - Array of all failures');
console.log('   window.jsonParseAttempts        - Array of all attempts');
console.log('   window.unhandledJsonErrors      - Async JSON errors');
console.log('   window.debugJsonParse("text")   - Test specific JSON');
console.log('');

console.log('7️⃣ SPECIFIC SCENARIOS TO TEST:');
console.log('   • Page refresh (initial load)');
console.log('   • Navigate to /tree page');
console.log('   • Select different jewels');
console.log('   • Use search functionality');
console.log('   • Hard refresh (Ctrl+Shift+R)');
console.log('   • Open in incognito mode');
console.log('');

console.log('8️⃣ EXPECTED OUTCOMES:');
console.log('   Scenario A: WASM timing issue');
console.log('   → You\'ll see parse failures before WASM data is ready');
console.log('   → Stack trace points to wasiDataService.ts or tree/+page.svelte');
console.log('');
console.log('   Scenario B: Malformed stored data');
console.log('   → Parse failures from sessionStorage/localStorage');
console.log('   → Stack trace points to +layout.ts or utilities');
console.log('');
console.log('   Scenario C: Network/API issue');
console.log('   → response.json() failures');
console.log('   → HTML error pages being parsed as JSON');
console.log('');

console.log('9️⃣ WHAT TO REPORT BACK:');
console.log('   • The exact "🔥 JSON.parse #X FAILED:" messages');
console.log('   • The "🎯 Likely caller:" information');
console.log('   • The raw text that failed (first 200 chars shown)');
console.log('   • When the exceptions occurred (page load, navigation, etc.)');
console.log('   • Results of window.showJsonStats()');
console.log('');

console.log('🚀 READY TO HUNT! The enhanced instrumentation is now active.');
console.log('   Every JSON.parse call will be logged with detailed context.');
console.log('   The two mysterious exceptions can\'t hide anymore! 🕵️‍♂️');

export {};
