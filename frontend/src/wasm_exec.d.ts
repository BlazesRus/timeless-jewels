// Type declarations for Go WASM execution
declare global {
  interface Window {
    Go: any;
  }
  
  namespace globalThis {
    var Go: any;
    var go: any;
    var fs: any;
    var process: any;
    var goInternalError: string | undefined;
  }
}

export {};
