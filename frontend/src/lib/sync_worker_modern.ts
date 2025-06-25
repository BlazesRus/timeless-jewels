import { expose } from 'comlink';
import '../wasm_exec.js';
import { loadSkillTree, passiveToTree } from './skill_tree_modern';
import type { SearchWithSeed, ReverseSearchConfig, SearchResults } from './skill_tree_modern';
import { calculator, initializeCrystalline } from './types/ModernTypes';

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
    calculator.subscribe(value => calculatorValue = value)();
    
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
  }
};

expose(obj);

export type WorkerType = typeof obj;
