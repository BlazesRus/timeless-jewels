// Global WASM type declarations for Modern mode
export {};

declare global {
  interface Window {
    Go: any;
  }
  
  var globalThis: {
    Go: any;
    go: any;
    fs: any;
    process: any;
    goInternalError: string | undefined;
  } & typeof globalThis;
}
