// Modern TypeScript interfaces for the worker
import type { Query } from './utils/trade_utils';

// Re-export Query type for convenience
export type { Query } from './utils/trade_utils';

export interface SearchProgressCallback {
  (seed: number): Promise<void>;
}

export interface SearchConfig {
  nodes: number[];
  stats: StatConfig[];
  jewel: number;
  conqueror: string;
  minTotalWeight: number;
  minTotalStats: number;
}

export interface StatConfig {
  id: number;
  min: number;
  weight: number;
  minStatTotal: number;
}

export interface SearchWithSeed {
  skills: SkillResult[];
  seed: number;
  weight: number;
  statCounts: Record<number, number>;
  statTotal: Record<number, number>;
  totalStats: number;
}

export interface SkillResult {
  passive: number;
  stats: Record<string, number>;
}

export interface SearchResults {
  grouped: Record<number, SearchWithSeed[]>;
  raw: SearchWithSeed[];
}

export interface WorkerInitConfig {
  wasmBuffer: ArrayBuffer;
}

// Modern worker interface with better error handling and async/await
export interface ModernTimelessWorker {
  /**
   * Initialize the worker with WASM data
   * @param config Configuration containing WASM buffer
   */
  initialize(config: WorkerInitConfig): Promise<void>;
  
  /**
   * Perform a reverse search with progress callback
   * @param config Search configuration
   * @param onProgress Progress callback function
   */
  reverseSearch(config: SearchConfig, onProgress?: SearchProgressCallback): Promise<SearchResults>;
  
  /**
   * Check if the worker is initialized
   */
  isInitialized(): boolean;
  
  /**
   * Get worker health status
   */
  getStatus(): Promise<{ initialized: boolean; ready: boolean }>;
}
