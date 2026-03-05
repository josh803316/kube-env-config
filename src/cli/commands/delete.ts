import { loadConfig } from '../../config/loader.js';
import { checkProtectedNamespace, checkProtectedEnvironment } from '../../guards/index.js';
import { k8sList, k8sDelete, k8sDeleteCollection } from '../../k8s/operations.js';
import { resourceRegistry } from '../../k8s/resources.js';
import { logger } from '../../logger.js';

interface DeleteOptions {
  resource: string;
  namespace: string;
  service?: string;
  environment?: string;
  dryRun?: boolean;
}

interface K8sList {
  items: Array<{ metadata?: { name?: string } }>;
}

export async function runDelete(opts: DeleteOptions): Promise<void> {
  const config = await loadConfig();

  checkProtectedNamespace(opts.namespace, config);
  if (opts.environment) {
    checkProtectedEnvironment(opts.environment, config);
  }

  const cfg = resourceRegistry[opts.resource];
  if (!cfg) {
    logger.error(`Unknown resource type: ${opts.resource}`);
    process.exit(1);
  }

  if (opts.dryRun) {
    logger.info(`[dry-run] Would delete all ${opts.resource} resources in namespace ${opts.namespace}`);
    return;
  }

  if (cfg.operations.deleteCollection && !cfg.clusterScoped) {
    await k8sDeleteCollection(opts.resource, opts.namespace);
    logger.success(`Deleted all ${opts.resource} resources in ${opts.namespace}`);
    return;
  }

  // Fall back to list + delete individually
  const list = (await k8sList(opts.resource, opts.namespace)) as K8sList;
  if (!list?.items?.length) {
    logger.info(`No ${opts.resource} resources found in ${opts.namespace}`);
    return;
  }

  for (const item of list.items) {
    const name = item.metadata?.name;
    if (!name) continue;
    await k8sDelete(opts.resource, name, opts.namespace);
    logger.success(`Deleted ${opts.resource}/${name} in ${opts.namespace}`);
  }
}
