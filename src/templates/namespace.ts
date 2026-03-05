import { k8sList } from '../k8s/operations.js';
import { logger } from '../logger.js';

interface K8sList {
  items: unknown[];
}

export async function readTemplatesFromNamespace(
  resource: string,
  sourceNamespace: string
): Promise<unknown[]> {
  logger.debug(`Reading ${resource} templates from namespace ${sourceNamespace}`);
  const result = (await k8sList(resource, sourceNamespace)) as K8sList;
  if (!result?.items) {
    logger.warn(`No ${resource} resources found in namespace ${sourceNamespace}`);
    return [];
  }
  return result.items;
}

export async function readSingleTemplateFromNamespace(
  resource: string,
  name: string,
  sourceNamespace: string
): Promise<unknown> {
  logger.debug(`Reading ${resource}/${name} from namespace ${sourceNamespace}`);
  const { k8sRead } = await import('../k8s/operations.js');
  return k8sRead(resource, name, sourceNamespace);
}
