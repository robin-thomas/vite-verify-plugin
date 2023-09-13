export interface PluginOptions {
  /**
   * @dev peerDependencies from package.json
   */
  peerDependencies: Record<string, string>;

  /**
   * @dev dependencies to ignore during verification
   * @default []
   * @example ['react', 'react-dom']
   */
  dependenciesToIgnore?: string[];

  /**
   * @dev skip verification when bundling for storybook
   * @default true
   */
  skipStorybook?: boolean;
}
