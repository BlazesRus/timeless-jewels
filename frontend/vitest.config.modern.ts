// Modern Vitest Configuration Placeholder
// Will be properly configured once vitest is installed via package.json

const config = {
  esbuild: {
    target: 'es2023' as const
  },

  define: {
    __SVELTE_BUILD_VERSION__: JSON.stringify(5),
    __NODE_VERSION__: JSON.stringify('22.0.0')
  }
};

export default config;
