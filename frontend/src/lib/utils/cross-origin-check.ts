// Simple cross-origin isolation check script
// This can be run in the browser console to check isolation status

console.log('🔍 Cross-Origin Isolation Check');
console.log('================================');

// Check SharedArrayBuffer availability (primary indicator)
const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
console.log(`SharedArrayBuffer available: ${hasSharedArrayBuffer ? '✅ YES' : '❌ NO'}`);

// Check cross-origin isolation API
const isIsolated = window.crossOriginIsolated || false;
console.log(`crossOriginIsolated: ${isIsolated ? '✅ YES' : '❌ NO'}`);

// Check headers (if available)
if (typeof performance !== 'undefined' && performance.getEntriesByType) {
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    console.log('Navigation timing available - check Network tab for headers');
  }
}

// Recommendations
console.log('\n📋 Recommendations:');
if (!hasSharedArrayBuffer) {
  console.log('❌ Need Cross-Origin-Embedder-Policy: require-corp');
  console.log('❌ Need Cross-Origin-Opener-Policy: same-origin');
  console.log('📝 These should be set in your Vite server headers');
}

if (!isIsolated) {
  console.log('❌ Cross-origin isolation not fully enabled');
  console.log('📝 Check that both COEP and COOP headers are properly set');
}

if (hasSharedArrayBuffer && isIsolated) {
  console.log('✅ Cross-origin isolation is properly configured!');
  console.log('✅ Wasmer SDK should be able to use SharedArrayBuffer');
}

// Additional debug info
console.log('\n🔧 Debug Info:');
console.log(`User Agent: ${navigator.userAgent}`);
console.log(`Location: ${window.location.href}`);
console.log(`Protocol: ${window.location.protocol}`);

export default {
  hasSharedArrayBuffer,
  isIsolated,
  isProperlyConfigured: hasSharedArrayBuffer && isIsolated
};
