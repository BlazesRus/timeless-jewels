// vite.config.ts
import ghpagesConfig from './vite.ghpages.config';
import rendererConfig from './vite.renderer.config';
import electronConfig from './vite.electron.config';
import { defineConfig } from 'vite';

export default defineConfig(({ mode, command, ssrBuild }) => {
  const target = process.env.BUILD_TARGET;
  if (target === 'ghpages') return ghpagesConfig;
  if (target === 'electron') return electronConfig;
  return rendererConfig;
});
