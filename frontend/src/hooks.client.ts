/**
 * Client-side hooks for browser polyfills, fixes, and debugging
 *
 * This file sets up necessary polyfills for Node.js APIs in the browser,
 * specifically for WASI compatibility, and includes debugging tools.
 */

import { Buffer } from 'buffer';

// 🔥 Global JSON.parse instrumentation for debugging
// Keep a reference to the real parser
const _origParse = JSON.parse;

let parseCount = 0;

JSON.parse = (text: string, reviver?: any) => {
  parseCount++;
  const parseId = parseCount;

  // 🛡️ Fix for SvelteKit session storage undefined parsing issue
  if (text === undefined || text === null) {
    console.warn(`🛡️ JSON.parse #${parseId} blocked undefined/null parse (SvelteKit session storage fix)`);
    throw new SyntaxError('JSON.parse: unexpected character at line 1 column 1 of the JSON data');
  }

  // Log every parse attempt for detailed tracking
  console.log(`🔍 JSON.parse #${parseId} called:`, {
    textType: typeof text,
    textLength: text?.length || 0,
    firstChars: text?.substring(0, 100) || 'N/A',
    callStack: new Error().stack?.split('\n').slice(1, 5).join('\n') || 'No stack'
  });

  try {
    const result = _origParse(text, reviver);
    console.log(`✅ JSON.parse #${parseId} succeeded`);
    return result;
  } catch (err) {
    // Log the raw payload and a stack trace with enhanced detail
    console.error(`🔥 JSON.parse #${parseId} FAILED:`, {
      text: text,
      textType: typeof text,
      textLength: text?.length || 0,
      firstChars: text?.substring(0, 200) || 'N/A',
      lastChars: text?.substring(Math.max(0, (text?.length || 0) - 100)) || 'N/A',
      error: err,
      errorMessage: err instanceof Error ? err.message : String(err),
      fullStack: new Error().stack,
      parseAttemptNumber: parseId
    });

    // Also try to identify the caller more clearly
    const stack = new Error().stack;
    if (stack) {
      const lines = stack.split('\n');
      const caller = lines.find(line =>
        !line.includes('JSON.parse') &&
        !line.includes('hooks.client.ts') &&
        line.includes('at ')
      );
      console.error(`🎯 Likely caller: ${caller || 'Unknown'}`);
    }

    throw err; // re-throw so existing handlers still catch it
  }
};

console.log('🔧 Enhanced JSON.parse instrumentation enabled - will log ALL parse attempts and failures');

// Ensure Buffer is available globally for WASI compatibility
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
  console.log('✅ Buffer polyfill enabled for WASI compatibility');
}

// Also ensure it's available on globalThis for broader compatibility
if (typeof globalThis !== 'undefined' && !(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

// Fix for SvelteKit session storage JSON parsing errors
// Clear any malformed session storage entries that might cause parse errors
if (typeof window !== 'undefined' && window.sessionStorage) {
  try {
    console.log('🔍 Checking session storage for malformed entries...');

    // Check for common SvelteKit session storage keys that might be malformed
    const svelteKitKeys = Object.keys(sessionStorage).filter(key =>
      key.startsWith('sveltekit:') || key.startsWith('sk:')
    );

    let cleanedCount = 0;
    for (const key of svelteKitKeys) {
      try {
        const value = sessionStorage.getItem(key);
        if (value && value.trim()) {
          JSON.parse(value); // Test if it's valid JSON
        }
      } catch (e) {
        // Remove malformed entries that cause JSON parse errors
        console.warn('🧹 Removing malformed session storage entry:', key, e);
        sessionStorage.removeItem(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`✅ Cleaned ${cleanedCount} malformed session storage entries`);
    } else {
      console.log('✅ No malformed session storage entries found');
    }
  } catch (e) {
    // If session storage is not available or there's an error, ignore it
    console.warn('Unable to clean session storage:', e);
  }
}

// Add fetch instrumentation to catch response.json() failures too
const _origFetch = window.fetch;
let fetchCount = 0;

window.fetch = async (...args) => {
  fetchCount++;
  const fetchId = fetchCount;

  console.log(`🌐 Fetch #${fetchId} called:`, args[0]);

  const response = await _origFetch(...args);

  // Clone the response so we can intercept .json() calls
  const clonedResponse = response.clone();
  const originalJson = clonedResponse.json;

  clonedResponse.json = async function() {
    console.log(`📄 response.json() #${fetchId} called for:`, args[0], {
      status: this.status,
      statusText: this.statusText,
      contentType: this.headers.get('content-type'),
      url: this.url
    });

    try {
      const text = await this.text();
      console.log(`📄 response.json() #${fetchId} raw text:`, {
        textLength: text?.length || 0,
        firstChars: text?.substring(0, 200) || 'N/A',
        lastChars: text?.substring(Math.max(0, (text?.length || 0) - 100)) || 'N/A',
        isEmptyString: text === '',
        isWhitespace: text?.trim() === ''
      });

      const parsed = JSON.parse(text);
      console.log(`✅ response.json() #${fetchId} succeeded`);
      return parsed;
    } catch (err) {
      console.error(`🔥 response.json() #${fetchId} FAILED for:`, args[0], {
        status: this.status,
        statusText: this.statusText,
        contentType: this.headers.get('content-type'),
        url: this.url,
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err)
      });
      throw err;
    }
  };

  return clonedResponse;
};

console.log('🔧 Enhanced fetch instrumentation enabled - will log ALL fetch calls and response.json() attempts');

// 🎯 Exception breakpoint helper - run this in DevTools console
// to pause on JSON exceptions: breakOnJsonExceptions()
(window as any).breakOnJsonExceptions = () => {
  const script = document.createElement('script');
  script.textContent = `
    // Enable DevTools to pause on JSON parse exceptions
    console.log('🛑 JSON exception breakpoints enabled. DevTools will pause on JSON.parse failures.');
    console.log('💡 To disable: breakOffJsonExceptions()');
  `;
  document.head.appendChild(script);
};

(window as any).breakOffJsonExceptions = () => {
  console.log('✅ JSON exception breakpoints disabled.');
};

// 🔍 Manual debugging helpers available in console
(window as any).debugJsonParse = (text: string) => {
  console.log('🔍 Debug JSON.parse attempt:', {
    text,
    type: typeof text,
    length: text?.length,
    firstChars: text?.substring(0, 100),
    lastChars: text?.substring(Math.max(0, (text?.length || 0) - 50)),
    trimmed: text?.trim(),
    isEmpty: !text || text.trim() === ''
  });

  try {
    const result = JSON.parse(text);
    console.log('✅ Parse successful:', result);
    return result;
  } catch (e) {
    console.error('❌ Parse failed:', e);
    return null;
  }
};

// 🎯 Store parse attempts for analysis
(window as any).jsonParseAttempts = [];
(window as any).jsonParseFailures = [];

// Hook into our instrumented JSON.parse to store attempts
const _ourParse = JSON.parse;
JSON.parse = (text: string, reviver?: any) => {
  const attempt = {
    timestamp: Date.now(),
    text: text?.substring(0, 500), // Store first 500 chars
    textLength: text?.length || 0,
    stack: new Error().stack
  };

  (window as any).jsonParseAttempts.push(attempt);

  try {
    return _ourParse(text, reviver);
  } catch (err) {
    const failure = {
      ...attempt,
      error: err instanceof Error ? err.message : String(err),
      fullError: err
    };
    (window as any).jsonParseFailures.push(failure);
    throw err;
  }
};

console.log('🎯 JSON debugging tools loaded:');
console.log('  • window.debugJsonParse(text) - manually test JSON parsing');
console.log('  • window.jsonParseAttempts - array of all parse attempts');
console.log('  • window.jsonParseFailures - array of all parse failures');
console.log('  • window.breakOnJsonExceptions() - enable DevTools breakpoints');

// 📊 Summary logger
(window as any).showJsonStats = () => {
  console.log('📊 JSON Parse Statistics:', {
    totalAttempts: (window as any).jsonParseAttempts.length,
    totalFailures: (window as any).jsonParseFailures.length,
    successRate: `${Math.round(((window as any).jsonParseAttempts.length - (window as any).jsonParseFailures.length) / (window as any).jsonParseAttempts.length * 100)}%`,
    failures: (window as any).jsonParseFailures
  });
};

// 🚨 Add unhandled promise rejection tracking for JSON-related async errors
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  const errorMsg = error instanceof Error ? error.message : String(error);

  if (errorMsg.includes('JSON') || errorMsg.includes('parse') || errorMsg.includes('Unexpected token')) {
    console.error('🚨 Unhandled JSON-related promise rejection:', {
      error: error,
      message: errorMsg,
      stack: error instanceof Error ? error.stack : 'No stack',
      timestamp: Date.now()
    });

    // Store for analysis
    if (!(window as any).unhandledJsonErrors) {
      (window as any).unhandledJsonErrors = [];
    }
    (window as any).unhandledJsonErrors.push({
      error,
      message: errorMsg,
      stack: error instanceof Error ? error.stack : 'No stack',
      timestamp: Date.now()
    });
  }
});

// 🎯 Session/localStorage monitoring for malformed JSON
const monitorStorage = () => {
  ['sessionStorage', 'localStorage'].forEach(storageType => {
    const storage = (window as any)[storageType];
    if (!storage) return;

    console.log(`🔍 Monitoring ${storageType} for JSON issues...`);

    // Check existing items
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        try {
          const value = storage.getItem(key);
          if (value && value.trim().startsWith('{') || value.trim().startsWith('[')) {
            JSON.parse(value); // Test parse
          }
        } catch (e) {
          console.warn(`🧹 Found malformed JSON in ${storageType}.${key}:`, e);
        }
      }
    }
  });
};

// Monitor storage on load
monitorStorage();

console.log('🛡️ Enhanced JSON exception monitoring active:');
console.log('  • Global JSON.parse instrumentation with call tracking');
console.log('  • Fetch response.json() monitoring');
console.log('  • Unhandled promise rejection tracking');
console.log('  • Storage JSON validation');
console.log('  • DevTools helpers available');
console.log('');
console.log('🎯 To analyze exceptions after they occur:');
console.log('  1. window.showJsonStats() - view summary');
console.log('  2. window.jsonParseFailures - detailed failure array');
console.log('  3. window.unhandledJsonErrors - async JSON errors');
console.log('  4. Check console for 🔥 markers on failures');

// 🎨 Visual indicator that instrumentation is active
const createInstrumentationIndicator = () => {
  const indicator = document.createElement('div');
  indicator.id = 'json-instrumentation-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #2563eb;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    cursor: pointer;
    user-select: none;
  `;
  indicator.textContent = '🔍 JSON Monitor Active';
  indicator.title = 'Click for debug tools';

  indicator.addEventListener('click', () => {
    console.log('🎯 JSON Debugging Tools:');
    console.log('window.showJsonStats() - View parse statistics');
    console.log('window.jsonParseFailures - Array of failures');
    console.log('window.debugJsonParse(text) - Test JSON parsing');
    (window as any).showJsonStats();
  });

  document.body.appendChild(indicator);

  // Update indicator with stats
  setInterval(() => {
    const attempts = (window as any).jsonParseAttempts?.length || 0;
    const failures = (window as any).jsonParseFailures?.length || 0;
    indicator.textContent = `🔍 JSON: ${attempts} attempts, ${failures} failures`;
    indicator.style.background = failures > 0 ? '#dc2626' : '#2563eb';
  }, 1000);
};

// Create indicator when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createInstrumentationIndicator);
} else {
  createInstrumentationIndicator();
}

// SvelteKit required exports
export const handleError = async ({ error, event }) => {
  console.error('🔥 SvelteKit client error:', error);

  // Track JSON-related errors specifically
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    console.error('🔥 JSON-related SvelteKit error detected:', {
      error: error.message,
      url: event.url,
      stack: error.stack
    });
  }
};

export const init = async () => {
  console.log('🚀 SvelteKit client initialized');

  // PWA Service Worker Registration for offline support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered successfully:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 New content is available; please refresh.');
                // You could show a notification to the user here
              }
            });
          }
        });
      } catch (error) {
        console.warn('⚠️ Service Worker registration failed:', error);
      }
    });
  }

  console.log(`🎯 PWA Support: ${'serviceWorker' in navigator ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
  console.log(`📱 Offline Ready: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'}`);
};
