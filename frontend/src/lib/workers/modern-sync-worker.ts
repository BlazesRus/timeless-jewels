import { expose } from 'comlink';
import { ModernGo } from './ModernWasm/go-runtime.worker';
import { loadSkillTree, passiveToTree } from './skill_tree_modern.worker';
import { calculator, initializeCrystalline } from './types/ModernTypes.worker';
import type { ModernTimelessWorker, SearchConfig, SearchResults, SearchWithSeed, SearchProgressCallback, WorkerInitConfig } from './modern-worker-types';

/**
 * Modern TimelessJewel Worker implementation with better error handling,
 * async/await patterns, and TypeScript support
 */
class ModernTimelessWorkerImpl implements ModernTimelessWorker {
  private initialized = false;
  private ready = false;

  /**
   * Initialize the worker with WASM data
   */
  async initialize(config: WorkerInitConfig): Promise<void> {
    try {
      // Use the Go WASM runtime
      const go = new (globalThis as any).Go();

      // Instantiate WASM module
      const result = await WebAssembly.instantiate(config.wasmBuffer, go.importObject);

      // Run the Go program
      go.run(result.instance);

      // Wait for Go exports to be available
      const exportedObjects = await new Promise<any>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50;

        const checkExports = () => {
          attempts++;

          const goGlobal = (globalThis as any)['go'];
          if (goGlobal && goGlobal['timeless-jewels']) {
            const timelessExports = goGlobal['timeless-jewels'];

            if (timelessExports.Calculate && timelessExports.data) {
              resolve({
                calculator: {
                  Calculate: timelessExports.Calculate,
                  ReverseSearch: timelessExports.ReverseSearch || null
                },
                data: timelessExports.data
              });
              return;
            }
          }

          if (attempts >= maxAttempts) {
            reject(new Error(`Timeout waiting for Go exports after ${maxAttempts} attempts`));
            return;
          }

          setTimeout(checkExports, 200);
        };

        checkExports();
      });

      // Set the calculator instance in worker context
      calculator.set(exportedObjects.calculator);

      // Initialize crystalline data structures
      initializeCrystalline();

      // Load skill tree data
      loadSkillTree();

      this.initialized = true;
      this.ready = true;

      console.log('TimelessJewel Worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TimelessJewel Worker:', error);
      throw new Error(`Worker initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if worker is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get worker status
   */
  async getStatus(): Promise<{ initialized: boolean; ready: boolean }> {
    return {
      initialized: this.initialized,
      ready: this.ready
    };
  }

  /**
   * Perform reverse search with modern async/await pattern
   */
  async reverseSearch(config: SearchConfig, onProgress?: SearchProgressCallback): Promise<SearchResults> {
    if (!this.initialized) {
      throw new Error('Worker not initialized. Call initialize() first.');
    }

    if (!this.ready) {
      throw new Error('Worker not ready for operations.');
    }

    try {
      // Validate configuration
      this.validateSearchConfig(config);

      // Create progress callback wrapper with error handling
      const progressCallback = onProgress
        ? async (seed: number) => {
            try {
              await onProgress(seed);
            } catch (error) {
              console.warn('Progress callback error:', error);
              // Don't throw - allow search to continue
            }
          }
        : async () => {
            /* no-op */
          };

      // Perform the search using the calculator
      const calculatorValue = calculator.get();

      if (!calculatorValue) {
        throw new Error('Calculator not initialized');
      }

      const searchResult = await calculatorValue.ReverseSearch(
        config.nodes,
        config.stats.map(s => s.id),
        config.jewel,
        config.conqueror,
        progressCallback
      );

      // Process and group results
      const processedResults = this.processSearchResults(searchResult, config);

      console.log(`Search completed. Found ${processedResults.raw.length} results.`);

      return processedResults;
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate search configuration
   */
  private validateSearchConfig(config: SearchConfig): void {
    if (!config.nodes || config.nodes.length === 0) {
      throw new Error('Search configuration must include at least one node');
    }

    if (!config.stats || config.stats.length === 0) {
      throw new Error('Search configuration must include at least one stat');
    }

    if (typeof config.jewel !== 'number' || config.jewel < 0) {
      throw new Error('Invalid jewel ID');
    }

    if (typeof config.conqueror !== 'string') {
      throw new Error('Invalid conqueror - must be a string');
    }

    // Validate stat configurations
    for (const stat of config.stats) {
      if (typeof stat.id !== 'number') {
        throw new Error('Stat ID must be a number');
      }
      if (typeof stat.min !== 'number' || stat.min < 0) {
        throw new Error('Stat minimum must be a non-negative number');
      }
      if (typeof stat.weight !== 'number' || stat.weight < 0) {
        throw new Error('Stat weight must be a non-negative number');
      }
      if (typeof stat.minStatTotal !== 'number' || stat.minStatTotal < 0) {
        throw new Error('Stat minStatTotal must be a non-negative number');
      }
    }
  }

  /**
   * Process raw search results into grouped format
   */
  private processSearchResults(searchResult: Record<string, Record<string, Record<string, number>>>, config: SearchConfig): SearchResults {
    const searchGrouped: Record<number, SearchWithSeed[]> = {};

    // Process each seed result
    Object.keys(searchResult).forEach(seedStr => {
      const seed = parseInt(seedStr, 10);
      const seedData = searchResult[seed];
      if (!seedData) {
        return;
      }

      let weight = 0;
      let totalStats = 0;
      const statCounts: Record<number, number> = {};
      const statTotal: Record<number, number> = {};

      // Process skills for this seed
      const skills = Object.keys(seedData)
        .map(skillIDStr => {
          const skillID = parseInt(skillIDStr, 10);
          const skillData = seedData[skillID];
          if (!skillData) {
            return {
              passive: passiveToTree[skillID] || skillID,
              stats: {}
            };
          }

          // Process stats for this skill
          Object.keys(skillData).forEach(statIdStr => {
            const statId = parseInt(statIdStr, 10);
            const statValue = skillData[statIdStr];
            if (statValue === undefined) {
              return;
            }

            // Update counters
            statCounts[statId] = (statCounts[statId] || 0) + 1;
            statTotal[statId] = (statTotal[statId] ?? 0) + statValue;
            totalStats += statValue;

            // Calculate weight
            const statConfig = config.stats.find(s => s.id === statId);
            if (statConfig) {
              weight += statConfig.weight;
            }
          });

          return {
            passive: passiveToTree[skillID] || skillID,
            stats: skillData
          };
        })
        .filter(skill => skill.passive !== undefined);

      // Group by number of affected skills
      const skillCount = Object.keys(seedData).length;
      if (!searchGrouped[skillCount]) {
        searchGrouped[skillCount] = [];
      }

      searchGrouped[skillCount].push({
        skills,
        seed,
        weight,
        statCounts,
        statTotal,
        totalStats
      });
    });

    // Filter and sort results
    Object.keys(searchGrouped).forEach(skillCountStr => {
      const skillCount = parseInt(skillCountStr, 10);
      const group = searchGrouped[skillCount];
      if (!group) {
        return;
      }

      // Filter based on criteria
      searchGrouped[skillCount] = group.filter(result => {
        return this.matchesSearchCriteria(result, config);
      });

      // Remove empty groups
      if (searchGrouped[skillCount]?.length === 0) {
        delete searchGrouped[skillCount];
      } else {
        // Sort by weight (descending)
        searchGrouped[skillCount].sort((a, b) => b.weight - a.weight);
      }
    });

    // Create flattened raw results
    const raw = Object.values(searchGrouped)
      .flat()
      .sort((a, b) => b.weight - a.weight);

    return {
      grouped: searchGrouped,
      raw
    };
  }

  /**
   * Check if a result matches the search criteria
   */
  private matchesSearchCriteria(result: SearchWithSeed, config: SearchConfig): boolean {
    // Check minimum total weight
    if (result.weight < config.minTotalWeight) {
      return false;
    }

    // Check minimum total stats
    if (result.totalStats < config.minTotalStats) {
      return false;
    }

    // Check individual stat requirements
    for (const statConfig of config.stats) {
      const statCount = result.statCounts[statConfig.id] ?? 0;
      const statTotal = result.statTotal[statConfig.id] ?? 0;

      // Check minimum count
      if (statCount < statConfig.min) {
        return false;
      }

      // Check minimum stat total
      if (statTotal < statConfig.minStatTotal) {
        return false;
      }
    }

    return true;
  }
}

// Create and expose the worker instance
const modernWorker = new ModernTimelessWorkerImpl();
expose(modernWorker);

// Export the type for use in main thread
export type ModernWorkerType = ModernTimelessWorkerImpl;
