import { expose, transfer } from 'comlink';
import '../wasm_exec.js';
import { loadSkillTree, passiveToTree } from './skill_tree_modern.worker';
import type { SearchWithSeed, ReverseSearchConfig, SearchResults } from './skill_tree_modern';
import { calculator, initializeCrystalline } from './types/ModernTypes.worker';

// Modern worker implementation with enhanced error handling and performance
const obj = {
  // Modern async boot with transfer optimization for ArrayBuffer
  async boot(wasm: ArrayBuffer): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const go = new Go();
      const result = await WebAssembly.instantiate(wasm, go.importObject);
      
      // Use transfer for ArrayBuffer performance
      await go.run(result.instance);

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

      // Set the calculator and data instances in worker context
      calculator.set(exportedObjects.calculator);

      await initializeCrystalline();
      await loadSkillTree();
      
      console.log('Modern worker initialized successfully');
    } catch (error) {
      console.error('Modern worker initialization failed:', error);
      throw new Error(`Worker boot failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  // Enhanced search with modern error boundaries and abortable operations
  async search(
    args: ReverseSearchConfig, 
    callback: (seed: number) => Promise<void>,
    signal?: AbortSignal
  ): Promise<SearchResults> {
    try {
      // Modern signal-based cancellation support
      if (signal?.aborted) {
        throw new Error('Search operation was aborted');
      }

      const calculatorValue = calculator.get();
      
      if (!calculatorValue) {
        throw new Error('Calculator not initialized - call boot() first');
      }

      // Enhanced callback with abort signal support
      const abortableCallback = async (seed: number) => {
        if (signal?.aborted) {
          throw new Error('Search operation was aborted');
        }
        await callback(seed);
      };

      const searchResult = await calculatorValue.ReverseSearch(
        args.nodes,
        args.stats.map(s => s.id),
        args.jewel,
        args.conqueror,
        abortableCallback
      );

      const searchGrouped: { [key: number]: SearchWithSeed[] } = {};
      Object.keys(searchResult).forEach(seedStr => {
        if (signal?.aborted) {
          throw new Error('Search operation was aborted');
        }

        const seed = parseInt(seedStr);
        const seedData = searchResult[seed];
        if (!seedData) {
          return;
        }

        let weight = 0;
        let totalStats = 0;

        const statCounts: Record<number, number> = {};
        const statTotal: Record<number, number> = {};
        
        const skills = Object.keys(seedData).map(skillIDStr => {
          const skillID = parseInt(skillIDStr);
          const skillData = seedData[skillID];
          if (!skillData) {
            return {
              passive: passiveToTree[skillID] || skillID,
              stats: {}
            };
          }
          
          Object.keys(skillData).forEach(st => {
            const n = parseInt(st);
            statCounts[n] = (statCounts[n] || 0) + 1;
            weight += args.stats.find(s => s.id == n)?.weight || 0;
            const statValue = skillData[st];
            if (statValue !== undefined) {
              statTotal[n] = (statTotal[n] ?? 0) + statValue;
              totalStats += statValue;
            }
          });

          return {
            passive: passiveToTree[skillID] || skillID,
            stats: skillData
          };
        }).filter(skill => skill.passive !== undefined && typeof skill.passive === 'number');

        const len = Object.keys(seedData).length;
        searchGrouped[len] = [
          ...(searchGrouped[len] || []),
          {
            skills: skills,
            seed,
            weight,
            statCounts,
            statTotal,
            totalStats
          }
        ];
      });

      Object.keys(searchGrouped).forEach(len => {
        const nLen = parseInt(len);
        const groupedArray = searchGrouped[nLen];
        if (!groupedArray) {
          return;
        }
        
        searchGrouped[nLen] = groupedArray.filter(g => {
          if (g.weight < args.minTotalWeight) {
            return false;
          }

          for (const stat of args.stats) {
            const statCount = g.statCounts?.[stat.id];
            if ((statCount === undefined && stat.min > 0) || (statCount !== undefined && statCount < stat.min)) {
              return false;
            }
            //Check if minimum stat total is reached
            const statTotalValue = g.statTotal?.[stat.id];
            if (statTotalValue !== undefined && statTotalValue < stat.minStatTotal) {
              return false;
            }
          }
          //Check if minimum total target stats is reached
          if (g.totalStats < args.minTotalStats) {
            return false;
          }
          return true;
        });

        if (searchGrouped[nLen]?.length === 0) {
          delete searchGrouped[nLen];
        }
      });

      return {
        grouped: searchGrouped,
        raw: Object.keys(searchGrouped)
          .map(len => searchGrouped[parseInt(len)])
          .flat()
          .filter((item): item is SearchWithSeed => item !== undefined)
          .sort((a, b) => (b?.weight || 0) - (a?.weight || 0))
          .slice(0, 100)
      };

    } catch (error) {
      console.error('Modern worker search failed:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

expose(obj);

export type WorkerType = typeof obj;
