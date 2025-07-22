// @ts-nocheck
// Legacy sync worker with type suppression
import { expose } from 'comlink';
import '../wasm_exec.js';
import { loadSkillTree, passiveToTree } from '../skill_tree_legacy';
import type { SearchWithSeed, ReverseSearchConfig, SearchResults } from '../skill_tree_legacy';
import { calculator, initializeCrystalline } from '../types/LegacyTypes';

const obj = {
  boot(wasm: ArrayBuffer) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const go = new Go();
    WebAssembly.instantiate(wasm, go.importObject).then(result => {
      go.run(result.instance);

      initializeCrystalline();

      loadSkillTree();
    });
  },
  async search(args: ReverseSearchConfig, callback: (seed: number) => Promise<void>): Promise<SearchResults> {
    let calculatorValue: any;

    // Legacy Svelte 4 store subscription pattern
    const unsubscribe = calculator.subscribe(value => {
      calculatorValue = value;
    });

    // Clean up subscription
    unsubscribe();

    if (!calculatorValue) {
      throw new Error('Calculator not initialized');
    }

    const searchResult = await calculatorValue.ReverseSearch(
      args.nodes,
      args.stats.map(s => s.id),
      args.jewel,
      args.conqueror,
      callback
    );

    const searchGrouped: { [key: number]: SearchWithSeed[] } = {};
    Object.keys(searchResult).forEach(seedStr => {
      const seed = parseInt(seedStr);

      let weight = 0;
      let totalStats = 0;

      const statCounts: Record<number, number> = {};
      const statTotal: Record<number, number> = {};
      const skills = Object.keys(searchResult?.[seed] ?? {}).map(skillIDStr => {
        const skillID = parseInt(skillIDStr);
        Object.keys(searchResult[seed][skillID]).forEach(st => {
          const n = parseInt(st);
          statCounts[n] = (statCounts[n] || 0) + 1;
          weight += args.stats.find(s => s.id == n)?.weight || 0;
          const statValue = searchResult[seed][skillID][st];
          statTotal[n] = (statTotal[n] ?? 0) + statValue;
          totalStats += statValue;
        });

        return {
          passive: passiveToTree[skillID],
          stats: searchResult[seed][skillID]
        };
      });

      const len = Object.keys(searchResult[seed]).length;
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
      searchGrouped[nLen] = searchGrouped[nLen].filter(g => {
        if (g.weight < args.minTotalWeight) {
          return false;
        }

        for (const stat of args.stats) {
          if ((g.statCounts[stat.id] === undefined && stat.min > 0) || g.statCounts[stat.id] < stat.min) {
            return false;
          }
          //Check if minimum stat total is reached
          if (g.statTotal[stat.id] < stat.minStatTotal) {
            return false;
          }
        }
        //Check if minimum total target stats is reached
        if (g.totalStats < args.minTotalStats) {
          return false;
        }
        return true;
      });

      if (Object.keys(searchGrouped[nLen]).length == 0) {
        delete searchGrouped[nLen];
      } else {
        searchGrouped[nLen] = searchGrouped[nLen].sort((a, b) => b.weight - a.weight);
      }
    });

    return {
      grouped: searchGrouped,
      raw: Object.keys(searchGrouped)
        .map(x => searchGrouped[parseInt(x)])
        .flat()
        .sort((a, b) => b.weight - a.weight)
    };
  }
} as const;

expose(obj);

export type WorkerType = typeof obj;
