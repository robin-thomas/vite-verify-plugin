import type { Plugin } from 'vite';

import type { PluginOptions } from './index.types';

const getPeerDependencies = (dependencies: PluginOptions['peerDependencies']) => {
  if (!dependencies) {
    throw new Error('[vite-verify-plugin]: Missing peerDependencies in plugin options');
  }

  if (typeof dependencies !== 'object' || Array.isArray(dependencies)) {
    throw new Error('[vite-verify-plugin]: peerDependencies must be an object');
  }

  return dependencies;
};

const getDefaultOptions = (options: PluginOptions): PluginOptions => ({
  skipStorybook: options.skipStorybook ?? true,
  dependenciesToIgnore: options.dependenciesToIgnore ?? [],
  peerDependencies: getPeerDependencies(options.peerDependencies),
});

const plugin = (options: PluginOptions): Plugin => ({
  name: 'vite-verify-plugin',
  enforce: 'post',
  apply: 'build',
  generateBundle: (config, bundle) => {
    const _options = getDefaultOptions(options);

    if (_options.skipStorybook && config.dir?.endsWith('storybook-static')) {
      return;
    }

    const deps = new Set([...Object.keys(bundle), ...Object.keys(_options.peerDependencies)]);

    const unknown = new Set<string>();
    Object.values(bundle).forEach((output) => {
      const { imports } = output as unknown as { imports: string[] };

      if (!imports) {
        return;
      }

      imports.forEach((dep) => {
        if (!deps.has(dep) && !_options.dependenciesToIgnore!.includes(dep)) {
          unknown.add(dep);
        }
      });
    });

    if (unknown.size) {
      const missing = Array.from(unknown)
        .map((e) => `"${e}"`)
        .join(', ');

      throw new Error(`[vite-verify-plugin]: Found unknown external reference(s): ${missing}`);
    }

    console.log('[vite-verify-plugin]: Found no unknown external references');
  },
});

export default plugin;
