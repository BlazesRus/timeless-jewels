/*Modernized for Svelte 5*/
import { expose, transfer } from 'comlink';
// Modern worker - uses JewelGenService singleton for WASM loading
import { loadSkillTree, passiveToTree } from './skill_tree_modern.worker';
import type { SearchWithSeed, ReverseSearchConfig, SearchResults } from './skill_tree_modern.worker';
import { initialize, wasmFunctions, wasmDataFields, isReady } from '../services/JewelGenService.svelte';

// Modern worker implementation with enhanced error handling and performance
const obj = {
  // Modern async boot with JewelGenService singleton
  async boot(wasm: ArrayBuffer): Promise<void> {
    try {
      // Use JewelGenService singleton instead of legacy WASM loading
      const success = await initialize('sync_worker_modern');

      if (!success) {
        throw new Error('JewelGenService initialization failed');
      }

      // Initialize skill tree data
      await loadSkillTree();

      console.log('Modern worker initialized successfully with JewelGenService');
    } catch (error) {
      console.error('Modern worker initialization failed:', error);
      throw new Error(`Worker boot failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  // Enhanced search with modern error boundaries and abortable operations
  async search(args: ReverseSearchConfig, callback: (seed: number) => Promise<void>, signal?: AbortSignal): Promise<SearchResults> {
    try {
      // Modern signal-based cancellation support
      if (signal?.aborted) {
        throw new Error('Search operation was aborted');
      }

      if (!isReady()) {
        throw new Error('WASM not initialized - call boot() first');
      }

      // Enhanced callback with abort signal support
      const abortableCallback = async (seed: number) => {
        if (signal?.aborted) {
          throw new Error('Search operation was aborted');
        }
        await callback(seed);
      };

      const searchResult = await wasmFunctions.reverseSearch(
        args.nodes,
        args.stats.map(s => s.id),
        args.jewel,
        args.conqueror
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

        const skills = Object.keys(seedData)
          .map(skillIDStr => {
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
          })
          .filter(skill => skill.passive !== undefined && typeof skill.passive === 'number');

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
