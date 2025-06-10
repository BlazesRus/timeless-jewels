// Type definitions for Go WASM runtime
declare global {
  interface Error {
    code?: string;
  }

  interface GlobalThis {
    fs?: any;
    process?: any;
    crypto: Crypto;
    performance: Performance;
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
    Go: typeof GoClass;
    go?: any;
  }

  class GoClass {
    argv: string[];
    env: Record<string, string>;
    exit: (code: number) => void;
    mem: DataView;
    exited: boolean;
    importObject: WebAssembly.Imports;

    constructor();
    run(instance: WebAssembly.Instance): Promise<void>;
    _resume(): void;
    _makeFuncWrapper(id: number): Function;
  }
}

declare const Go: typeof GoClass;

export {};
