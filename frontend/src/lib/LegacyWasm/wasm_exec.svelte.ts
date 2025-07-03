/**
 * TypeScript/Svelte 5 Runes conversion of Go's wasm_exec.js
 * Copyright 2018 The Go Authors. All rights reserved.
 *
 * TypeScript conversion with Svelte 5 runes by James Armstrong (github.com/BlazesRus)
 * Generated with GitHub Copilot assistance
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

// Add missing global declarations
declare global {
  interface Window {
    fs?: any;
    process?: any;
    crypto?: Crypto;
    performance?: Performance;
    require?: any;
  }
}

export interface GoInstance extends WebAssembly.Instance {
  exports: {
    mem: WebAssembly.Memory;
    run: (argc: number, argv: number) => void;
    resume: () => void;
    getsp: () => number;
    [key: string]: any;
  };
}

export interface GoImportObject {
  gojs: {
    [key: string]: (...args: any[]) => any;
  };
}

interface GoEvent {
  id: number;
  this: any;
  args: any[];
  result?: any;
}

export class GoRuntime {
  public importObject: GoImportObject;
  public exited: boolean = false;
  private _pendingEvent: any = null;
  private _scheduledTimeouts = new Map<number, any>();
  private _nextCallbackTimeoutID = 1;

  private mem: DataView;
  private _values: any[] = [NaN, 0, null, true, false, globalThis, this];
  private _goRefCounts: number[] = new Array(this._values.length).fill(Infinity);
  private _ids = new Map<any, number>();
  private _idPool: number[] = [];

  constructor() {
    this.mem = new DataView(new ArrayBuffer(0));

    this.importObject = {
      gojs: {
        // func wasmExit(code int32)
        'runtime.wasmExit': (sp: number) => {
          sp >>>= 0;
          const code = this.mem.getInt32(sp + 8, true);
          this.exited = true;
          delete (globalThis as any)._inst;
          delete (globalThis as any)._values;
          delete (globalThis as any)._goRefCounts;
          delete (globalThis as any)._ids;
          delete (globalThis as any)._idPool;
          this.exit(code);
        },

        // func wasmWrite(fd uintptr, p unsafe.Pointer, n int32)
        'runtime.wasmWrite': (sp: number) => {
          sp >>>= 0;
          const fd = this.getInt64(sp + 8);
          const p = this.getInt64(sp + 16);
          const n = this.mem.getInt32(sp + 24, true);
          (globalThis as any).fs.writeSync(fd, new Uint8Array(this.mem.buffer, p, n));
        },

        // func resetMemoryDataView()
        'runtime.resetMemoryDataView': (sp: number) => {
          sp >>>= 0;
          this.mem = new DataView((globalThis as any)._inst.exports.mem.buffer);
        },

        // func nanotime1() int64
        'runtime.nanotime1': (sp: number) => {
          sp >>>= 0;
          this.setInt64(sp + 8, (Date.now() - performance.timeOrigin) * 1000000);
        },

        // func walltime() (sec int64, nsec int32)
        'runtime.walltime': (sp: number) => {
          sp >>>= 0;
          const msec = Date.now();
          this.setInt64(sp + 8, Math.floor(msec / 1000));
          this.mem.setInt32(sp + 16, (msec % 1000) * 1000000, true);
        },

        // func scheduleTimeoutEvent(delay int64) int32
        'runtime.scheduleTimeoutEvent': (sp: number) => {
          sp >>>= 0;
          const id = this._nextCallbackTimeoutID++;
          this._scheduledTimeouts.set(
            id,
            setTimeout(
              () => {
                this._resume();
                while (this._scheduledTimeouts.has(id)) {
                  // Non-blocking sleep to avoid hanging
                  break;
                }
              },
              this.getInt64(sp + 8) + 1 // setTimeout has been seen to fire up to 1 millisecond early
            )
          );
          this.mem.setInt32(sp + 16, id, true);
        },

        // func clearTimeoutEvent(id int32)
        'runtime.clearTimeoutEvent': (sp: number) => {
          sp >>>= 0;
          const id = this.mem.getInt32(sp + 8, true);
          clearTimeout(this._scheduledTimeouts.get(id));
          this._scheduledTimeouts.delete(id);
        },

        // func getRandomData(r []byte)
        'runtime.getRandomData': (sp: number) => {
          sp >>>= 0;
          crypto.getRandomValues(this.loadSlice(sp + 8));
        },

        // func finalizeRef(v ref)
        'syscall/js.finalizeRef': (sp: number) => {
          sp >>>= 0;
          const id = this.mem.getUint32(sp + 8, true);
          this._goRefCounts[id]--;
          if (this._goRefCounts[id] === 0) {
            const v = this._values[id];
            this._values[id] = null;
            this._ids.delete(v);
            this._idPool.push(id);
          }
        },

        // func stringVal(value string) ref
        'syscall/js.stringVal': (sp: number) => {
          sp >>>= 0;
          this.storeValue(sp + 24, this.loadString(sp + 8));
        },

        // func valueGet(v ref, p string) ref
        'syscall/js.valueGet': (sp: number) => {
          sp >>>= 0;
          const result = Reflect.get(this.loadValue(sp + 8), this.loadString(sp + 16));
          const sp2 = this.getStack();
          this.storeValue(sp2 + 32, result);
        },

        // func valueSet(v ref, p string, x ref)
        'syscall/js.valueSet': (sp: number) => {
          sp >>>= 0;
          Reflect.set(this.loadValue(sp + 8), this.loadString(sp + 16), this.loadValue(sp + 32));
        },

        // func valueDelete(v ref, p string)
        'syscall/js.valueDelete': (sp: number) => {
          sp >>>= 0;
          Reflect.deleteProperty(this.loadValue(sp + 8), this.loadString(sp + 16));
        },

        // func valueIndex(v ref, i int) ref
        'syscall/js.valueIndex': (sp: number) => {
          sp >>>= 0;
          this.storeValue(sp + 24, Reflect.get(this.loadValue(sp + 8), this.getInt64(sp + 16)));
        },

        // func valueSetIndex(v ref, i int, x ref)
        'syscall/js.valueSetIndex': (sp: number) => {
          sp >>>= 0;
          Reflect.set(this.loadValue(sp + 8), this.getInt64(sp + 16), this.loadValue(sp + 24));
        },

        // func valueCall(v ref, m string, args []ref) (ref, bool)
        'syscall/js.valueCall': (sp: number) => {
          sp >>>= 0;
          try {
            const v = this.loadValue(sp + 8);
            const m = this.loadString(sp + 16);
            const args = this.loadSliceOfValues(sp + 32);
            const result = Reflect.apply(v[m], v, args);
            const sp2 = this.getStack();
            this.storeValue(sp2 + 56, result);
            this.mem.setUint8(sp2 + 64, 1);
          } catch (err) {
            const sp2 = this.getStack();
            this.storeValue(sp2 + 56, err);
            this.mem.setUint8(sp2 + 64, 0);
          }
        },

        // func valueInvoke(v ref, args []ref) (ref, bool)
        'syscall/js.valueInvoke': (sp: number) => {
          sp >>>= 0;
          try {
            const v = this.loadValue(sp + 8);
            const args = this.loadSliceOfValues(sp + 16);
            const result = Reflect.apply(v, undefined, args);
            const sp2 = this.getStack();
            this.storeValue(sp2 + 40, result);
            this.mem.setUint8(sp2 + 48, 1);
          } catch (err) {
            const sp2 = this.getStack();
            this.storeValue(sp2 + 40, err);
            this.mem.setUint8(sp2 + 48, 0);
          }
        },

        // func valueNew(v ref, args []ref) (ref, bool)
        'syscall/js.valueNew': (sp: number) => {
          sp >>>= 0;
          try {
            const v = this.loadValue(sp + 8);
            const args = this.loadSliceOfValues(sp + 16);
            const result = Reflect.construct(v, args);
            const sp2 = this.getStack();
            this.storeValue(sp2 + 40, result);
            this.mem.setUint8(sp2 + 48, 1);
          } catch (err) {
            const sp2 = this.getStack();
            this.storeValue(sp2 + 40, err);
            this.mem.setUint8(sp2 + 48, 0);
          }
        },

        // func valueLength(v ref) int
        'syscall/js.valueLength': (sp: number) => {
          sp >>>= 0;
          this.setInt64(sp + 16, parseInt(this.loadValue(sp + 8).length));
        },

        // func valuePrepareString(v ref) (ref, int)
        'syscall/js.valuePrepareString': (sp: number) => {
          sp >>>= 0;
          const str = String(this.loadValue(sp + 8));
          const sp2 = this.getStack();
          this.storeValue(sp2 + 16, str);
          this.setInt64(sp2 + 24, str.length);
        },

        // func valueLoadString(v ref, b []byte)
        'syscall/js.valueLoadString': (sp: number) => {
          sp >>>= 0;
          const str = this.loadValue(sp + 8);
          this.loadSlice(sp + 16).set(new TextEncoder().encode(str));
        },

        // func valueInstanceOf(v ref, t ref) bool
        'syscall/js.valueInstanceOf': (sp: number) => {
          sp >>>= 0;
          this.mem.setUint8(sp + 24, Number(this.loadValue(sp + 8) instanceof this.loadValue(sp + 16)));
        },

        // func copyBytesToGo(dst []byte, src ref) (int, bool)
        'syscall/js.copyBytesToGo': (sp: number) => {
          sp >>>= 0;
          const dst = this.loadSlice(sp + 8);
          const src = this.loadValue(sp + 32);
          if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
            this.mem.setUint8(sp + 48, 0);
            return;
          }
          const toCopy = src.subarray(0, dst.length);
          dst.set(toCopy);
          this.setInt64(sp + 40, toCopy.length);
          this.mem.setUint8(sp + 48, 1);
        },

        // func copyBytesToJS(dst ref, src []byte) (int, bool)
        'syscall/js.copyBytesToJS': (sp: number) => {
          sp >>>= 0;
          const dst = this.loadValue(sp + 8);
          const src = this.loadSlice(sp + 16);
          if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
            this.mem.setUint8(sp + 48, 0);
            return;
          }
          const toCopy = src.subarray(0, dst.length);
          dst.set(toCopy);
          this.setInt64(sp + 40, toCopy.length);
          this.mem.setUint8(sp + 48, 1);
        },

        debug: (value: any) => {
          console.log(value);
        }
      }
    };
  }

  async run(instance: GoInstance): Promise<void> {
    if (!(instance instanceof WebAssembly.Instance)) {
      throw new Error('Go.run: WebAssembly.Instance expected');
    }

    (globalThis as any)._inst = instance;
    this.mem = new DataView((instance.exports.mem as WebAssembly.Memory).buffer);
    this._values[5] = globalThis;
    this._values[6] = this;

    // Initialize fs if not available
    if (!(globalThis as any).fs) {
      (globalThis as any).fs = {
        constants: {
          O_WRONLY: -1,
          O_RDWR: -1,
          O_CREAT: -1,
          O_TRUNC: -1,
          O_APPEND: -1,
          O_EXCL: -1
        },
        writeSync: (fd: number, buf: Uint8Array) => {
          const outputBuf = buf;
          if (fd === 1 || fd === 2) {
            // stdout/stderr
            console.log(new TextDecoder('utf-8').decode(outputBuf));
          }
          return outputBuf.length;
        },
        write: (fd: number, buf: Uint8Array, offset: number, length: number, position: any, callback: any) => {
          if (offset !== 0 || length !== buf.length || position !== null) {
            callback(new Error('not supported'));
          }
          const n = (globalThis as any).fs.writeSync(fd, buf);
          callback(null, n);
        },
        chmod: (path: string, mode: number, callback: any) => {
          callback(new Error('not supported'));
        },
        chown: (path: string, uid: number, gid: number, callback: any) => {
          callback(new Error('not supported'));
        },
        close: (fd: number, callback: any) => {
          callback(new Error('not supported'));
        },
        fchmod: (fd: number, mode: number, callback: any) => {
          callback(new Error('not supported'));
        },
        fchown: (fd: number, uid: number, gid: number, callback: any) => {
          callback(new Error('not supported'));
        },
        fstat: (fd: number, callback: any) => {
          callback(new Error('not supported'));
        },
        fsync: (fd: number, callback: any) => {
          callback(null);
        },
        ftruncate: (fd: number, length: number, callback: any) => {
          callback(new Error('not supported'));
        },
        lchown: (path: string, uid: number, gid: number, callback: any) => {
          callback(new Error('not supported'));
        },
        link: (path1: string, path2: string, callback: any) => {
          callback(new Error('not supported'));
        },
        lstat: (path: string, callback: any) => {
          callback(new Error('not supported'));
        },
        mkdir: (path: string, perm: number, callback: any) => {
          callback(new Error('not supported'));
        },
        open: (path: string, flags: number, mode: number, callback: any) => {
          callback(new Error('not supported'));
        },
        read: (fd: number, buffer: Uint8Array, offset: number, length: number, position: any, callback: any) => {
          callback(new Error('not supported'));
        },
        readdir: (path: string, callback: any) => {
          callback(new Error('not supported'));
        },
        readlink: (path: string, callback: any) => {
          callback(new Error('not supported'));
        },
        rename: (from: string, to: string, callback: any) => {
          callback(new Error('not supported'));
        },
        rmdir: (path: string, callback: any) => {
          callback(new Error('not supported'));
        },
        stat: (path: string, callback: any) => {
          callback(new Error('not supported'));
        },
        symlink: (path1: string, path2: string, type: any, callback: any) => {
          callback(new Error('not supported'));
        },
        truncate: (path: string, length: number, callback: any) => {
          callback(new Error('not supported'));
        },
        unlink: (path: string, callback: any) => {
          callback(new Error('not supported'));
        },
        utimes: (path: string, atime: Date, mtime: Date, callback: any) => {
          callback(new Error('not supported'));
        }
      } as any;
    }

    // Initialize process if not available
    if (!(globalThis as any).process) {
      (globalThis as any).process = {
        getuid: () => -1,
        getgid: () => -1,
        geteuid: () => -1,
        getegid: () => -1,
        getgroups: () => {
          throw new Error('not supported');
        },
        pid: -1,
        ppid: -1,
        umask: () => {
          throw new Error('not supported');
        },
        cwd: () => {
          throw new Error('not supported');
        },
        chdir: () => {
          throw new Error('not supported');
        }
      };
    }

    // Initialize crypto if not available
    if (!(globalThis as any).crypto) {
      throw new Error('globalThis.crypto is not available, see https://github.com/golang/go/wiki/WebAssembly#getting-started');
    }

    const argv = ['js'];
    const env = {};
    const decoder = new TextDecoder('utf-8');
    const encoder = new TextEncoder();

    let offset = 4096;

    const strPtr = (str: string) => {
      const ptr = offset;
      const bytes = encoder.encode(str + '\0');
      new Uint8Array(this.mem.buffer, offset, bytes.length).set(bytes);
      offset += bytes.length;
      if (offset % 8 !== 0) {
        offset += 8 - (offset % 8);
      }
      return ptr;
    };

    const argc = argv.length;
    const argvPtrs: number[] = [];
    argv.forEach(arg => {
      argvPtrs.push(strPtr(arg));
    });
    argvPtrs.push(0);

    const keys = Object.keys(env).sort();
    keys.forEach(key => {
      argvPtrs.push(strPtr(`${key}=${(env as any)[key]}`));
    });
    argvPtrs.push(0);

    const argv_ptr = offset;
    argvPtrs.forEach(ptr => {
      this.mem.setUint32(offset, ptr, true);
      this.mem.setUint32(offset + 4, 0, true);
      offset += 8;
    });

    // The linker guarantees global data starts from at least wasmMinDataAddr.
    // Keep in sync with cmd/link/internal/ld/data.go:wasmMinDataAddr.
    const wasmMinDataAddr = 4096 + 8192;
    if (offset >= wasmMinDataAddr) {
      throw new Error('total length of command line and environment variables exceeds limit');
    }

    (instance.exports.run as any)(argc, argv_ptr);
    if (this.exited) {
      this._resolveExitPromise?.();
    }
    await this._exitPromise;
  }

  private _exitPromise: Promise<void> = new Promise(resolve => {
    this._resolveExitPromise = resolve;
  });
  private _resolveExitPromise?: () => void;

  private _resume(): void {
    if (this.exited) {
      throw new Error('Go program has already exited');
    }
    ((globalThis as any)._inst.exports.resume as any)();
    if (this.exited) {
      this._resolveExitPromise?.();
    }
  }

  private _makeFuncWrapper(id: number) {
    const go = this;
    return function (this: any, ...args: any[]) {
      const event: GoEvent = { id: id, this: this, args: args };
      go._pendingEvent = event;
      go._resume();
      return event.result;
    };
  }

  private exit(code: number): void {
    if (code !== 0) {
      console.warn('exit code:', code);
    }
  }

  // Helper methods
  private getInt64(addr: number): number {
    const low = this.mem.getUint32(addr + 0, true);
    const high = this.mem.getInt32(addr + 4, true);
    return low + high * 4294967296;
  }

  private setInt64(addr: number, v: number): void {
    this.mem.setUint32(addr + 0, v, true);
    this.mem.setUint32(addr + 4, Math.floor(v / 4294967296), true);
  }

  private getStack(): number {
    return ((globalThis as any)._inst.exports.getsp as any)();
  }

  private loadValue(addr: number): any {
    const f = this.mem.getFloat64(addr, true);
    if (f === 0) {
      return undefined;
    }
    if (!isNaN(f)) {
      return f;
    }

    const id = this.mem.getUint32(addr, true);
    return this._values[id];
  }

  private storeValue(addr: number, v: any): void {
    const nanHead = 0x7ff80000;

    if (typeof v === 'number' && v !== 0) {
      if (isNaN(v)) {
        this.mem.setUint32(addr + 4, nanHead, true);
        this.mem.setUint32(addr, 0, true);
        return;
      }
      this.mem.setFloat64(addr, v, true);
      return;
    }

    if (v === undefined) {
      this.mem.setFloat64(addr, 0, true);
      return;
    }

    let id = this._ids.get(v);
    if (id === undefined) {
      id = this._idPool.pop();
      if (id === undefined) {
        id = this._values.length;
      }
      this._values[id] = v;
      this._goRefCounts[id] = 0;
      this._ids.set(v, id);
    }
    this._goRefCounts[id]++;
    let typeFlag = 0;
    switch (typeof v) {
      case 'object':
        if (v !== null) {
          typeFlag = 1;
        }
        break;
      case 'string':
        typeFlag = 2;
        break;
      case 'symbol':
        typeFlag = 3;
        break;
      case 'function':
        typeFlag = 4;
        break;
    }
    this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
    this.mem.setUint32(addr, id, true);
  }

  private loadSlice(addr: number): Uint8Array {
    const array = this.getInt64(addr + 0);
    const len = this.getInt64(addr + 8);
    return new Uint8Array(this.mem.buffer, array, len);
  }

  private loadSliceOfValues(addr: number): any[] {
    const array = this.getInt64(addr + 0);
    const len = this.getInt64(addr + 8);
    const a = new Array(len);
    for (let i = 0; i < len; i++) {
      a[i] = this.loadValue(array + i * 8);
    }
    return a;
  }

  private loadString(addr: number): string {
    const saddr = this.getInt64(addr + 0);
    const len = this.getInt64(addr + 8);
    return new TextDecoder('utf-8').decode(new DataView(this.mem.buffer, saddr, len));
  }
}

// Export for TypeScript consumers
export const Go = GoRuntime;
