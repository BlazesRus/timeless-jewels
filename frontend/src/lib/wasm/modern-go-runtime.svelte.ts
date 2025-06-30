/**
 * Modern TypeScript Go WASM Runtime
 * Compatible with Svelte 5 and modern TypeScript practices
 */

// Type definitions for Go WASM
interface GoInstance {
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): Promise<void>;
  _pendingEvent?: any;
  _scheduledTimeouts?: Map<number, any>;
  _nextCallbackTimeoutID?: number;
  exited?: boolean;
  mem?: DataView;
  _values?: any[];
  _goRefCounts?: any[];
  _ids?: Map<any, number>;
  _idPool?: number[];
}

// Modern Go class implementation
export class ModernGo implements GoInstance {
  importObject: WebAssembly.Imports;
  _pendingEvent: any = null;
  _scheduledTimeouts = new Map<number, any>();
  _nextCallbackTimeoutID = 1;
  exited = false;
  mem?: DataView;
  _values?: any[];
  _goRefCounts?: any[];
  _ids?: Map<any, number>;
  _idPool?: number[];

  constructor() {
    this.importObject = {
      go: {
        // System calls and Go runtime functions
        "runtime.wasmExit": (sp: number) => {
          sp >>>= 0;
          const code = this.mem!.getInt32(sp + 8, true);
          this.exited = true;
          delete (globalThis as any)._inst;
          delete (globalThis as any).go;
          if (code !== 0) {
            console.error("exit code:", code);
          }
        },

        "runtime.wasmWrite": (sp: number) => {
          sp >>>= 0;
          const fd = this.mem!.getInt64(sp + 8, true);
          const p = this.mem!.getInt64(sp + 16, true);
          const n = this.mem!.getInt32(sp + 24, true);
          const bytes = new Uint8Array(this.mem!.buffer, Number(p), n);
          if (fd === 1n) {
            console.log(new TextDecoder("utf-8").decode(bytes));
          } else if (fd === 2n) {
            console.error(new TextDecoder("utf-8").decode(bytes));
          } else {
            throw new Error("unknown file descriptor " + fd);
          }
        },

        "runtime.resetMemoryDataView": (sp: number) => {
          sp >>>= 0;
          this.mem = new DataView((globalThis as any)._inst.exports.mem.buffer);
        },

        "runtime.nanotime1": (sp: number) => {
          sp >>>= 0;
          this.setInt64(sp + 8, BigInt(Math.floor(performance.now() * 1000000)));
        },

        "runtime.walltime": (sp: number) => {
          sp >>>= 0;
          const msec = Date.now();
          this.setInt64(sp + 8, BigInt(Math.floor(msec / 1000)));
          this.mem!.setInt32(sp + 16, (msec % 1000) * 1000000, true);
        },

        "runtime.scheduleTimeoutEvent": (sp: number) => {
          sp >>>= 0;
          const id = this._nextCallbackTimeoutID++;
          this._scheduledTimeouts.set(id, setTimeout(
            () => {
              this._resume();
              while (this._scheduledTimeouts.has(id)) {
                console.warn("scheduleTimeoutEvent: missed timeout event");
                this._resume();
              }
            },
            Number(this.getInt64(sp + 8)) + 1,
          ));
          this.mem!.setInt32(sp + 16, id, true);
        },

        "runtime.clearTimeoutEvent": (sp: number) => {
          sp >>>= 0;
          const id = this.mem!.getInt32(sp + 8, true);
          clearTimeout(this._scheduledTimeouts.get(id));
          this._scheduledTimeouts.delete(id);
        },

        "runtime.getRandomData": (sp: number) => {
          sp >>>= 0;
          crypto.getRandomValues(new Uint8Array(this.mem!.buffer, Number(this.getInt64(sp + 8)), this.mem!.getInt32(sp + 16, true)));
        },

        "syscall/js.finalizeRef": (sp: number) => {
          sp >>>= 0;
          const id = this.mem!.getUint32(sp + 8, true);
          this._goRefCounts![id]--;
          if (this._goRefCounts![id] === 0) {
            const v = this._values![id];
            this._values![id] = null;
            this._ids!.delete(v);
            this._idPool!.push(id);
          }
        },

        "syscall/js.stringVal": (sp: number) => {
          sp >>>= 0;
          this.storeValue(sp + 24, this.loadString(sp + 8));
        },

        "syscall/js.valueGet": (sp: number) => {
          sp >>>= 0;
          const result = Reflect.get(this.loadValue(sp + 8), this.loadString(sp + 16));
          (globalThis as any).sp = sp;
          this.storeValue(sp + 32, result);
        },

        "syscall/js.valueSet": (sp: number) => {
          sp >>>= 0;
          Reflect.set(this.loadValue(sp + 8), this.loadString(sp + 16), this.loadValue(sp + 32));
        },

        "syscall/js.valueDelete": (sp: number) => {
          sp >>>= 0;
          Reflect.deleteProperty(this.loadValue(sp + 8), this.loadString(sp + 16));
        },

        "syscall/js.valueIndex": (sp: number) => {
          sp >>>= 0;
          this.storeValue(sp + 24, Reflect.get(this.loadValue(sp + 8), this.getInt64(sp + 16)));
        },

        "syscall/js.valueSetIndex": (sp: number) => {
          sp >>>= 0;
          Reflect.set(this.loadValue(sp + 8), this.getInt64(sp + 16), this.loadValue(sp + 24));
        },

        "syscall/js.valueCall": (sp: number) => {
          sp >>>= 0;
          try {
            const v = this.loadValue(sp + 8);
            const m = Reflect.get(v, this.loadString(sp + 16));
            const args = this.loadSliceOfValues(sp + 32);
            const result = Reflect.apply(m, v, args);
            (globalThis as any).sp = sp;
            this.storeValue(sp + 56, result);
            this.mem!.setUint8(sp + 64, 1);
          } catch (err) {
            (globalThis as any).sp = sp;
            this.storeValue(sp + 56, err);
            this.mem!.setUint8(sp + 64, 0);
          }
        },

        "syscall/js.valueInvoke": (sp: number) => {
          sp >>>= 0;
          try {
            const v = this.loadValue(sp + 8);
            const args = this.loadSliceOfValues(sp + 16);
            const result = Reflect.apply(v, undefined, args);
            (globalThis as any).sp = sp;
            this.storeValue(sp + 40, result);
            this.mem!.setUint8(sp + 48, 1);
          } catch (err) {
            (globalThis as any).sp = sp;
            this.storeValue(sp + 40, err);
            this.mem!.setUint8(sp + 48, 0);
          }
        },

        "syscall/js.valueNew": (sp: number) => {
          sp >>>= 0;
          try {
            const v = this.loadValue(sp + 8);
            const args = this.loadSliceOfValues(sp + 16);
            const result = Reflect.construct(v, args);
            (globalThis as any).sp = sp;
            this.storeValue(sp + 40, result);
            this.mem!.setUint8(sp + 48, 1);
          } catch (err) {
            (globalThis as any).sp = sp;
            this.storeValue(sp + 40, err);
            this.mem!.setUint8(sp + 48, 0);
          }
        },

        "syscall/js.valueLength": (sp: number) => {
          sp >>>= 0;
          this.setInt64(sp + 16, BigInt(this.loadValue(sp + 8).length));
        },

        "syscall/js.valuePrepareString": (sp: number) => {
          sp >>>= 0;
          const str = String(this.loadValue(sp + 8));
          const utf8 = new TextEncoder().encode(str);
          this.storeValue(sp + 16, utf8);
          this.setInt64(sp + 24, BigInt(utf8.length));
        },

        "syscall/js.valueLoadString": (sp: number) => {
          sp >>>= 0;
          const str = this.loadValue(sp + 8);
          new Uint8Array(this.mem!.buffer, Number(this.getInt64(sp + 16)), this.getInt64(sp + 24)).set(str);
        },

        "syscall/js.valueInstanceOf": (sp: number) => {
          sp >>>= 0;
          this.mem!.setUint8(sp + 24, (this.loadValue(sp + 8) instanceof this.loadValue(sp + 16)) ? 1 : 0);
        },

        "syscall/js.copyBytesToGo": (sp: number) => {
          sp >>>= 0;
          const dst = new Uint8Array(this.mem!.buffer, Number(this.getInt64(sp + 8)), this.getInt64(sp + 16));
          const src = this.loadValue(sp + 32);
          if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
            this.mem!.setUint8(sp + 48, 0);
            return;
          }
          const toCopy = Math.min(dst.length, src.length);
          dst.set(src.subarray(0, toCopy));
          this.setInt64(sp + 40, BigInt(toCopy));
          this.mem!.setUint8(sp + 48, 1);
        },

        "syscall/js.copyBytesToJS": (sp: number) => {
          sp >>>= 0;
          const dst = this.loadValue(sp + 8);
          const src = new Uint8Array(this.mem!.buffer, Number(this.getInt64(sp + 16)), this.getInt64(sp + 24));
          if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
            this.mem!.setUint8(sp + 48, 0);
            return;
          }
          const toCopy = Math.min(dst.length, src.length);
          dst.set(src.subarray(0, toCopy));
          this.setInt64(sp + 40, BigInt(toCopy));
          this.mem!.setUint8(sp + 48, 1);
        },

        debug: (value: any) => {
          console.log(value);
        },
      }
    };

    this._values = [
      NaN,
      0,
      null,
      true,
      false,
      globalThis,
      this,
    ];
    this._goRefCounts = new Array(this._values.length).fill(Infinity);
    this._ids = new Map([
      [0, 1],
      [null, 2],
      [true, 3],
      [false, 4],
      [globalThis, 5],
      [this, 6],
    ]);
    this._idPool = [];
    this.exited = false;

    // Modern alternative to deprecated arguments object
    const argv = typeof process !== 'undefined' && process.argv || ['js'];
    let offset = 4096;

    const strPtr = (str: string) => {
      const ptr = offset;
      const bytes = new TextEncoder().encode(str + "\0");
      new Uint8Array(this.mem!.buffer, offset, bytes.length).set(bytes);
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

    // Environment variables (simplified for browser)
    const envKeys = Object.keys(typeof process !== 'undefined' && process.env || {});
    envKeys.forEach(key => {
      strPtr(`${key}=${(process as any).env[key]}`);
    });

    const keys = Object.keys((globalThis as any).fs || {});
    keys.forEach(key => {
      strPtr(key);
    });
  }

  async run(instance: WebAssembly.Instance): Promise<void> {
    if (!(instance instanceof WebAssembly.Instance)) {
      throw new Error("Go.run: WebAssembly.Instance expected");
    }
    (globalThis as any)._inst = instance;
    this.mem = new DataView(instance.exports.mem.buffer);
    this._values![0] = NaN;
    this._values![1] = 0;
    this._values![2] = null;
    this._values![3] = true;
    this._values![4] = false;
    this._values![5] = globalThis;
    this._values![6] = this;

    let offset = 4096;
    const strPtr = (str: string): number => {
      const ptr = offset;
      const bytes = new TextEncoder().encode(str + "\0");
      new Uint8Array(this.mem!.buffer, offset, bytes.length).set(bytes);
      offset += bytes.length;
      if (offset % 8 !== 0) {
        offset += 8 - (offset % 8);
      }
      return ptr;
    };

    const argc = 1;
    const argvPtrs = [strPtr("js")];

    this.setInt64(offset, BigInt(argc));
    this.setInt64(offset + 8, BigInt(argvPtrs[0]));

    (globalThis as any).go = this;
    await new Promise<void>((resolve) => {
      (instance.exports.run as Function)(offset, offset + 8);
      if (this.exited) {
        this._resolveExitPromise?.();
      }
      resolve();
    });
  }

  _resume(): void {
    if (this.exited) {
      throw new Error("Go program has already exited");
    }
    (globalThis as any)._inst.exports.resume();
    if (this.exited) {
      this._resolveExitPromise?.();
    }
  }

  _makeFuncWrapper(id: number): Function {
    const go = this;
    return function (this: any, ...args: any[]) {
      const event = { id: id, this: this, args: args };
      go._pendingEvent = event;
      go._resume();
      return event.result;
    };
  }

  _resolveExitPromise?: () => void;

  // Helper methods
  private getInt64(addr: number): bigint {
    return this.mem!.getBigInt64(addr, true);
  }

  private setInt64(addr: number, v: bigint): void {
    this.mem!.setBigInt64(addr, v, true);
  }

  private loadValue(addr: number): any {
    const f = this.mem!.getFloat64(addr, true);
    if (f === 0) {
      return undefined;
    }
    if (!isNaN(f)) {
      return f;
    }

    const id = this.mem!.getUint32(addr, true);
    return this._values![id];
  }

  private storeValue(addr: number, v: any): void {
    const nanHead = 0x7FF80000;

    if (typeof v === "number" && v !== 0) {
      if (isNaN(v)) {
        this.mem!.setUint32(addr + 4, nanHead, true);
        this.mem!.setUint32(addr, 0, true);
        return;
      }
      this.mem!.setFloat64(addr, v, true);
      return;
    }

    if (v === undefined) {
      this.mem!.setFloat64(addr, 0, true);
      return;
    }

    let id = this._ids!.get(v);
    if (id === undefined) {
      id = this._idPool!.pop();
      if (id === undefined) {
        id = this._values!.length;
      }
      this._values![id] = v;
      this._goRefCounts![id] = 0;
      this._ids!.set(v, id);
    }
    this._goRefCounts![id]++;
    let typeFlag = 0;
    switch (typeof v) {
      case "object":
        if (v !== null) {
          typeFlag = 1;
        }
        break;
      case "string":
        typeFlag = 2;
        break;
      case "symbol":
        typeFlag = 3;
        break;
      case "function":
        typeFlag = 4;
        break;
    }
    this.mem!.setUint32(addr + 4, nanHead | typeFlag, true);
    this.mem!.setUint32(addr, id, true);
  }

  private loadString(addr: number): string {
    const saddr = Number(this.getInt64(addr + 0));
    const len = Number(this.getInt64(addr + 8));
    return new TextDecoder("utf-8").decode(new DataView(this.mem!.buffer, saddr, len));
  }

  private loadSliceOfValues(addr: number): any[] {
    const array = Number(this.getInt64(addr + 0));
    const len = Number(this.getInt64(addr + 8));
    const a = new Array(len);
    for (let i = 0; i < len; i++) {
      a[i] = this.loadValue(array + i * 8);
    }
    return a;
  }
}

// Export the modern Go class and make it globally available
export const Go = ModernGo;

// Set up global Go object for compatibility
(globalThis as any).Go = ModernGo;

console.log('✅ Modern Go WASM runtime loaded');
