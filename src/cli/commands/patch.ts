import chalk from 'chalk';
import { stringify as yamlStringify } from 'yaml';
import { readTemplateFromFile } from '../../templates/file.js';
import { k8sPatch } from '../../k8s/operations.js';
import { logger } from '../../logger.js';

interface PatchOptions {
  resource: string;
  namespace: string;
  name: string;
  manifest: string;
  dryRun?: boolean;
}

export async function runPatch(opts: PatchOptions): Promise<void> {
  const body = readTemplateFromFile(opts.manifest);

  if (opts.dryRun) {
    console.log(chalk.cyan('\n--- Dry run: patch body ---'));
    console.log(yamlStringify(body));
    return;
  }

  await k8sPatch(opts.resource, opts.name, body, opts.namespace);
  logger.success(`Patched ${opts.resource}/${opts.name} in ${opts.namespace}`);
}
