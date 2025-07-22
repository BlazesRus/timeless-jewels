/**
 * JSON Parse Analysis Script
 * Run this to find all JSON.parse and .json() usages in the codebase
 */

console.log('🔍 Searching for JSON.parse and .json() usages...\n');

// This will be run manually to search the codebase
const searchCommands = [
  'grep -r "JSON.parse" frontend/src --include="*.ts" --include="*.js" --include="*.svelte" -n',
  'grep -r "\\.json()" frontend/src --include="*.ts" --include="*.js" --include="*.svelte" -n',
  'grep -r "sessionStorage" frontend/src --include="*.ts" --include="*.js" --include="*.svelte" -n',
  'grep -r "localStorage" frontend/src --include="*.ts" --include="*.js" --include="*.svelte" -n'
];

console.log('Run these commands to find JSON parsing locations:');
searchCommands.forEach((cmd, i) => {
  console.log(`${i + 1}. ${cmd}`);
});

export {};
