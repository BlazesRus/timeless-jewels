/**
 * Cross-Origin Isolation Check Utility
 * 
 * Checks if the current context has cross-origin isolation enabled,
 * which is required for SharedArrayBuffer and advanced WASI features.
 * 
 * @returns {boolean} true if cross-origin isolation is enabled, false otherwise
 */
function crossOriginCheck(): boolean {
  return typeof window !== 'undefined' && !!(window.crossOriginIsolated);
}

/**
 * Detailed cross-origin isolation status information
 */
export const getDetailedStatus = () => {
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  const isIsolated = typeof window !== 'undefined' && !!(window.crossOriginIsolated);
  
  return {
    hasSharedArrayBuffer,
    isIsolated,
    isProperlyConfigured: hasSharedArrayBuffer && isIsolated
  };
};

export default crossOriginCheck;
