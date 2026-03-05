// Public API for @josh803316/kube-env-config

export type { KecConfig, ServiceConfig, TransformContext, TransformFn } from './config/types.js';
export { KecConfigSchema } from './config/types.js';
export { loadConfig } from './config/loader.js';
export { DEFAULT_PROTECTED_NAMESPACES, DEFAULT_PROTECTED_ENVIRONMENTS } from './config/defaults.js';

/**
 * Type-safe config helper. Use in kec.config.ts:
 *
 * ```ts
 * import { defineConfig } from '@josh803316/kube-env-config'
 * export default defineConfig({ ... })
 * ```
 */
export function defineConfig(config: import('./config/types.js').KecConfig): import('./config/types.js').KecConfig {
  return config;
}
