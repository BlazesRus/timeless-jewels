// vite.electron.config.ts
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import base from './vite.base.config';
import path from 'path';

export default mergeConfig(base, {
  build: {
    outDir: 'dist/electron',
    rollupOptions: {
      external: ['electron', 'fs', 'path'],
    },
  },
  plugins: [
    electron({
      main: { entry: 'electron/main.ts' },
      preload: { input: path.join(__dirname, 'electron/preload.ts') },
    }),
  ],
});
