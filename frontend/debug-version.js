// Debug script to test version detection
import fs from 'fs';
import path from 'path';

function readPackageVersion() {
  try {
    const packageJsonPath = path.resolve('./package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    console.log('Package.json devDependencies:', packageJson.devDependencies);
    console.log('Svelte version:', packageJson.devDependencies?.svelte);
    
    const svelteVersion = packageJson.devDependencies?.svelte;
    if (svelteVersion) {
      const match = svelteVersion.match(/(\^|~)?(\d+)/);
      console.log('Version match:', match);
      console.log('Major version:', match ? match[2] : 'unknown');
    }
  } catch (error) {
    console.error('Error reading package.json:', error);
  }
}

readPackageVersion();
