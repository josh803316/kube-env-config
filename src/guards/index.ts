import { DEFAULT_PROTECTED_NAMESPACES, DEFAULT_PROTECTED_ENVIRONMENTS } from '../config/defaults.js';
import type { KecConfig } from '../config/types.js';

export function checkProtectedNamespace(namespace: string, config: KecConfig | null): void {
  const extras = config?.protectedNamespaces ?? [];
  const all = [...DEFAULT_PROTECTED_NAMESPACES, ...extras];
  if (all.includes(namespace)) {
    throw new Error(`Namespace "${namespace}" is protected and cannot be modified.`);
  }
}

export function checkProtectedEnvironment(environment: string, config: KecConfig | null): void {
  const extras = config?.protectedEnvironments ?? [];
  const all = [...DEFAULT_PROTECTED_ENVIRONMENTS, ...extras];
  if (all.includes(environment)) {
    throw new Error(`Environment "${environment}" is protected — delete operations are not allowed.`);
  }
}
