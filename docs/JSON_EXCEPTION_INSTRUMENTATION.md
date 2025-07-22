# 🔥 JSON Exception Instrumentation - Implementation Summary

## 🎯 What We've Implemented

Your app now has **comprehensive JSON parsing instrumentation** to catch and analyze those two mysterious JSON exceptions. Here's what's been added:

### 1. Global JSON.parse Monitoring (`hooks.client.ts`)
- **Enhanced wrapper** around `JSON.parse` that logs every attempt
- **Unique ID tracking** for each parse attempt (#1, #2, #3, etc.)
- **Detailed failure logging** with stack traces and context
- **Raw payload inspection** (first/last chars, length, type)
- **Caller identification** to pinpoint the source code

### 2. Fetch Response Monitoring
- **Instrumented `window.fetch`** to catch `response.json()` failures
- **HTTP response context** (status, content-type, URL)
- **Raw response text analysis** before JSON parsing
- **Network-related JSON failures** tracking

### 3. Debug Tools (Available in Browser Console)
```javascript
// Analysis tools
window.showJsonStats()           // Summary of all parse attempts
window.jsonParseFailures         // Array of detailed failure info
window.jsonParseAttempts         // All parse attempts with context
window.unhandledJsonErrors       // Async JSON-related errors

// Manual testing
window.debugJsonParse("text")    // Test specific JSON strings
window.breakOnJsonExceptions()   // Enable DevTools breakpoints
```

### 4. Visual Monitoring
- **Blue indicator** in top-right corner shows "🔍 JSON Monitor Active"
- **Real-time stats** update every second (attempts/failures count)
- **Red indicator** when failures occur
- **Click indicator** for quick access to debug tools

### 5. Storage Validation
- **Automatic cleanup** of malformed sessionStorage entries
- **localStorage monitoring** for JSON issues
- **SvelteKit session** data validation

### 6. Exception Tracking
- **Unhandled promise rejection** monitoring for async JSON errors
- **Stack trace preservation** for all failures
- **Timestamp tracking** for temporal analysis

## 🕵️ How to Hunt the Exceptions

### Step 1: Open the App
```
http://localhost:5173/timeless-jewels
```

### Step 2: Enable DevTools Exception Breaking
1. Open DevTools (F12)
2. Sources tab → Event Listener Breakpoints
3. Expand "Exceptions" → ☑ "Thrown"

### Step 3: Watch the Console
Look for these specific messages:
- `🔍 JSON.parse #X called:` - Every attempt
- `🔥 JSON.parse #X FAILED:` - **THE EXCEPTIONS WE WANT!**
- `🎯 Likely caller:` - Source code location
- `🌐 Fetch #X called:` - Network requests

### Step 4: Analyze the Results
```javascript
// Run in console after exceptions occur
window.showJsonStats()  // Get the summary
```

## 🎯 Expected Exception Sources

Based on code analysis, the most likely culprits:

1. **WASI Data Service** (`wasiDataService.svelte.ts`)
   - Timing issues with WASM initialization
   - Malformed data from Go WASM functions

2. **Tree Page** (`tree/+page.svelte`)
   - Parsing WASM data before it's ready
   - possibleStats initialization race condition

3. **Layout Load** (`+layout.ts`)
   - Session data restoration
   - Malformed stored JSON strings

4. **Search Component** (`SearchComponent.svelte`)
   - API response parsing failures
   - Network error HTML being parsed as JSON

## 🔧 Files Modified

1. **`frontend/src/hooks.client.ts`** - Main instrumentation
2. **`frontend/scripts/json-hunting-guide.js`** - User guide
3. **`frontend/scripts/json-exception-analysis.js`** - Source analysis
4. **`frontend/scripts/find-json-usage.js`** - Search helper

## 🚀 Ready to Capture!

The instrumentation is **active and comprehensive**. Every JSON.parse call will be:
- ✅ Logged with unique ID
- ✅ Tracked with full context
- ✅ Analyzed for failures
- ✅ Stored for later analysis

**The two JSON exceptions can't hide anymore!** 🎯

### Next Steps:
1. **Use the app normally** (refresh, navigate, interact)
2. **Watch for 🔥 failure messages** in console
3. **Note the parse attempt numbers** and stack traces
4. **Run `window.showJsonStats()`** for summary
5. **Report back** with the specific failure details

The mystery will be solved! 🕵️‍♂️
