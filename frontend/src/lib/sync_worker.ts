import { expose } from 'comlink';
import '../wasm_exec.js';
import { loadSkillTree, passiveToTree } from './skill_tree';
import type { SearchWithSeed, ReverseSearchConfig, SearchResults } from './skill_tree';
import { calculator, initializeCrystalline } from './types';

const obj = {
  boot(wasm: ArrayBuffer) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const go = new Go();
    WebAssembly.instantiate(wasm, go.importObject).then((result) => {
      go.run(result.instance);

      initializeCrystalline();

      loadSkillTree();
    });
  },
  async search(args: ReverseSearchConfig, callback: (seed: number) => Promise<void>): Promise<SearchResults> {
    const searchResult = await calculator.ReverseSearch(
      args.nodes,
      args.stats.map((s) => s.id),
      args.jewel,
      args.conqueror,
      callback
    );

    const searchGrouped: { [key: number]: SearchWithSeed[] } = {};

    if (!searchResult) {
      return { grouped: {}, raw: [] };
    }

    Object.keys(searchResult).forEach((seedStr) => {
      const seed = parseInt(seedStr);
      const seedData = searchResult[seed];

      if (!seedData) {
        return;
      }

      let weight = 0;
      let totalStats = 0;

      const statCounts: Record<number, number> = {};
      const statTotal: Record<number, number> = {};
      const skills = Object.keys(seedData).map((skillIDStr) => {
        const skillID = parseInt(skillIDStr);
        const skillStats = seedData[skillID];

        if (!skillStats) {
          return {
            passive: passiveToTree[skillID] || skillID,
            stats: {}
          };
        }

        Object.keys(skillStats).forEach((st) => {
          const n = parseInt(st);
          statCounts[n] = (statCounts[n] || 0) + 1;
          weight += args.stats.find((s) => s.id == n)?.weight || 0;
          const statValue = skillStats[parseInt(st)];
          statTotal[n] = (statTotal[n] ?? 0) + statValue;
          totalStats += statValue;
        });

        return {
          passive: passiveToTree[skillID] || skillID,
          stats: skillStats as { [key: string]: number }
        };
      });

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

    Object.keys(searchGrouped).forEach((len) => {
      const nLen = parseInt(len);
      const filtered = searchGrouped[nLen].filter((g) => {
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

      if (filtered.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete searchGrouped[nLen];
      } else {
        searchGrouped[nLen] = filtered.sort((a, b) => b.weight - a.weight);
      }
    });

    return {
      grouped: searchGrouped,
      raw: Object.keys(searchGrouped)
        .map((x) => searchGrouped[parseInt(x)])
        .flat()
        .sort((a, b) => b.weight - a.weight)
    };
  }
} as const;

expose(obj);

export type WorkerType = typeof obj;
