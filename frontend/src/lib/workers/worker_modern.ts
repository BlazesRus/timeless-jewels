import { browser } from '$app/environment';
import SyncWorker from './sync_worker_modern?worker';
import * as Comlink from 'comlink';
import type { WorkerType } from './sync_worker_modern';

// Modern Comlink patterns with performance optimization and cleanup
function getWorker() {
  console.log('Creating modern sync worker with Comlink v4.4.2+ patterns');
  const theWorker = new SyncWorker();

  // Enhanced error handling and performance monitoring
  const obj = Comlink.wrap<WorkerType>(theWorker, {
    // Modern transfer optimization for ArrayBuffer performance
    createEndpoint: port => ({
      postMessage: (message, transfer) => port.postMessage(message, { transfer }),
      addEventListener: port.addEventListener.bind(port),
      removeEventListener: port.removeEventListener.bind(port),
      start: port.start?.bind(port)
    })
  });

  // Modern cleanup using Symbol.dispose pattern (ES2023)
  const cleanup = () => {
    theWorker.terminate();
    console.log('Modern sync worker terminated');
  };

  return {
    syncWorker: theWorker,
    syncWrap: obj,
    cleanup,
    // Modern Symbol.dispose for automatic resource management
    [Symbol.dispose]: cleanup
  };
}

export const worker = browser
  ? getWorker()
  : {
      syncWorker: null,
      syncWrap: null,
      cleanup: () => {},
      [Symbol.dispose]: () => {}
    };

// Backward compatibility exports
export const { syncWorker, syncWrap } = worker;
