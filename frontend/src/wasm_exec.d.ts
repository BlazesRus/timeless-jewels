// Type definitions for Go WASM runtime
declare global {
  interface Error {
    code?: string;
  }

  interface GlobalThis {
    fs?: {
      constants: Record<string, number>;
      writeSync: (fd: number, buf: Uint8Array) => number;
      write: (
        fd: number,
        buf: Uint8Array,
        offset: number,
        length: number,
        position: number | null,
        callback: (err: Error | null, bytesWritten?: number) => void
      ) => void;
      [key: string]: unknown;
    };
    process?: {
      getuid: () => number;
      getgid: () => number;
      geteuid: () => number;
      getegid: () => number;
      getgroups: () => number[];
      pid: number;
      ppid: number;
      umask: () => number;
      cwd: () => string;
      chdir: (path: string) => void;
      [key: string]: unknown;
    };
    crypto: Crypto;
    performance: Performance;
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
    Go: typeof GoClass;
    go?: GoClass;
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
    _makeFuncWrapper(id: number): (...args: unknown[]) => unknown;
  }
}

export {};
