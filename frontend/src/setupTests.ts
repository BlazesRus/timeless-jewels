// Modern test setup for Svelte 5 - simplified version without vitest imports
// This will work until vitest is properly installed

// Mock modern browser APIs for testing
const mockPerformance = {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
  getEntriesByType: () => [],
  observer: () => {}
};

// Mock IntersectionObserver for modern lazy loading tests
const mockIntersectionObserver = function (this: any, callback: any) {
  this.observe = () => {};
  this.unobserve = () => {};
  this.disconnect = () => {};
  this.takeRecords = () => [];
};

// Mock ResizeObserver for container queries
const mockResizeObserver = function (this: any, callback: any) {
  this.observe = () => {};
  this.unobserve = () => {};
  this.disconnect = () => {};
};

// Mock modern Web Workers
const mockWorker = function (this: any, url: string) {
  this.postMessage = () => {};
  this.terminate = () => {};
  this.addEventListener = () => {};
  this.removeEventListener = () => {};
};

// Mock WebAssembly for WASM tests with proper typing
const mockWebAssembly = {
  instantiate: async () => ({
    instance: { exports: {} },
    module: {}
  }),
  compile: async () => ({}),
  validate: () => true,
  compileStreaming: async () => ({}),
  instantiateStreaming: async () => ({
    instance: { exports: {} },
    module: {}
  }),
  CompileError: Error,
  Global: function () {},
  Instance: function () {},
  LinkError: Error,
  Memory: function () {},
  Module: function () {},
  RuntimeError: Error,
  Table: function () {}
};

// Apply mocks if in browser environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'performance', {
    value: mockPerformance,
    writable: true
  });

  (globalThis as any).IntersectionObserver = mockIntersectionObserver;
  (globalThis as any).ResizeObserver = mockResizeObserver;
  (globalThis as any).Worker = mockWorker;
  (globalThis as any).WebAssembly = mockWebAssembly;
}
