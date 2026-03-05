import { PatchStrategy, type ApiType } from '@kubernetes/client-node';
import { makeApiClient } from './client.js';
import { resourceRegistry, type ResourceConfig } from './resources.js';
import { logger } from '../logger.js';

type ApiRecord = Record<string, (...args: unknown[]) => Promise<unknown>>;

function unwrap(result: unknown): unknown {
  return (result as { body?: unknown })?.body ?? result;
}

async function callApi(api: ApiType, method: string, params: object): Promise<unknown> {
  logger.debug(`API call: ${method}`, params);
  const result = await (api as unknown as ApiRecord)[method](params);
  return unwrap(result);
}

export async function k8sRead(resource: string, name: string, namespace?: string): Promise<unknown> {
  const cfg = requireConfig(resource);
  const api = makeApiClient(cfg.api);
  const method = requireOp(cfg, 'read');
  return callApi(api, method, cfg.clusterScoped ? { name } : { name, namespace });
}

export async function k8sList(resource: string, namespace?: string, labelSelector?: string): Promise<unknown> {
  const cfg = requireConfig(resource);
  const api = makeApiClient(cfg.api);
  const method = requireOp(cfg, 'list');
  const params: Record<string, unknown> = {};
  if (!cfg.clusterScoped) params.namespace = namespace;
  if (labelSelector) params.labelSelector = labelSelector;
  return callApi(api, method, params);
}

export async function k8sCreate(resource: string, body: unknown, namespace?: string): Promise<unknown> {
  const cfg = requireConfig(resource);
  const api = makeApiClient(cfg.api);
  const method = requireOp(cfg, 'create');
  const params: Record<string, unknown> = { body };
  if (!cfg.clusterScoped) params.namespace = namespace;
  return callApi(api, method, params);
}

export async function k8sPatch(resource: string, name: string, body: unknown, namespace?: string): Promise<unknown> {
  const cfg = requireConfig(resource);
  const api = makeApiClient(cfg.api);
  const method = requireOp(cfg, 'patch');
  const params: Record<string, unknown> = {
    name,
    body,
    headers: { 'content-type': PatchStrategy.StrategicMergePatch },
  };
  if (!cfg.clusterScoped) params.namespace = namespace;
  return callApi(api, method, params);
}

export async function k8sDelete(resource: string, name: string, namespace?: string): Promise<unknown> {
  const cfg = requireConfig(resource);
  const api = makeApiClient(cfg.api);
  const method = requireOp(cfg, 'delete');
  return callApi(api, method, cfg.clusterScoped ? { name } : { name, namespace });
}

export async function k8sDeleteCollection(resource: string, namespace: string): Promise<unknown> {
  const cfg = requireConfig(resource);
  if (!cfg.operations.deleteCollection) {
    throw new Error(`Resource ${resource} does not support deleteCollection`);
  }
  const api = makeApiClient(cfg.api);
  return callApi(api, cfg.operations.deleteCollection, { namespace });
}

export async function k8sHealthCheck(name: string, namespace: string): Promise<unknown> {
  const cfg = requireConfig('deployment');
  const api = makeApiClient(cfg.api);
  return callApi(api, cfg.operations.healthCheck!, { name, namespace });
}

function requireConfig(resource: string): ResourceConfig {
  const cfg = resourceRegistry[resource];
  if (!cfg) throw new Error(`Unknown resource type: ${resource}`);
  return cfg;
}

function requireOp(cfg: ResourceConfig, op: keyof ResourceConfig['operations']): string {
  const name = cfg.operations[op];
  if (!name) throw new Error(`Operation ${op} not supported`);
  return name;
}
