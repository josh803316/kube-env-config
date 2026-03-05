import { stringify as yamlStringify } from 'yaml';
import { k8sRead } from '../../k8s/operations.js';
import { logger } from '../../logger.js';

interface ReadOptions {
  resource: string;
  namespace: string;
  name: string;
}

export async function runRead(opts: ReadOptions): Promise<void> {
  logger.debug(`Reading ${opts.resource}/${opts.name} in ${opts.namespace}`);
  const result = await k8sRead(opts.resource, opts.name, opts.namespace);
  console.log(yamlStringify(result));
}
