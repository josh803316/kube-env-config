import { stringify as yamlStringify } from 'yaml';
import { k8sList } from '../../k8s/operations.js';
import { logger } from '../../logger.js';

interface ListOptions {
  resource: string;
  namespace: string;
}

export async function runList(opts: ListOptions): Promise<void> {
  logger.debug(`Listing ${opts.resource} in ${opts.namespace}`);
  const result = await k8sList(opts.resource, opts.namespace);
  const items = (result as { items?: unknown[] })?.items ?? [];
  if (items.length === 0) {
    logger.info(`No ${opts.resource} resources found in ${opts.namespace}`);
    return;
  }
  console.log(yamlStringify(result));
}
