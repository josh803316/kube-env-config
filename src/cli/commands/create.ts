import chalk from 'chalk';
import { stringify as yamlStringify } from 'yaml';
import { loadConfig } from '../../config/loader.js';
import { resolveTemplates } from '../../templates/index.js';
import { applyTransforms } from '../../transforms/index.js';
import { checkProtectedNamespace } from '../../guards/index.js';
import { k8sCreate, k8sPatch } from '../../k8s/operations.js';
import { logger } from '../../logger.js';
import type { TransformFn } from '../../config/types.js';

interface CreateOptions {
  resource: string;
  namespace: string;
  service?: string;
  image?: string;
  manifest?: string;
  dryRun?: boolean;
  environment?: string;
}

export async function runCreate(opts: CreateOptions): Promise<void> {
  const config = await loadConfig();

  checkProtectedNamespace(opts.namespace, config);

  if (opts.service && config?.services) {
    const svcConfig = config.services[opts.service];
    if (svcConfig?.allowedResources && !svcConfig.allowedResources.includes(opts.resource)) {
      logger.error(`Service "${opts.service}" does not allow resource type "${opts.resource}".`);
      process.exit(1);
    }
  }

  if (!config && !opts.manifest) {
    logger.error('No kec.config.ts found and no --manifest provided. Cannot resolve templates.');
    process.exit(1);
  }

  const templates = await resolveTemplates(opts.resource, config!, {
    manifestFile: opts.manifest,
  });

  if (templates.length === 0) {
    logger.warn(`No templates found for ${opts.resource}`);
    return;
  }

  const ctx = {
    namespace: opts.namespace,
    service: opts.service,
    image: opts.image,
    environment: opts.environment,
  };

  const userTransform = config?.transforms?.[opts.resource] as TransformFn | undefined;

  for (const template of templates) {
    const resolved = await applyTransforms(template, ctx, userTransform);

    if (opts.dryRun) {
      console.log(chalk.cyan('\n--- Dry run: resolved manifest ---'));
      console.log(yamlStringify(resolved));
      continue;
    }

    const name = (resolved as { metadata?: { name?: string } })?.metadata?.name;
    try {
      await k8sCreate(opts.resource, resolved, opts.namespace);
      logger.success(`Created ${opts.resource}${name ? `/${name}` : ''} in ${opts.namespace}`);
    } catch (err: unknown) {
      // Attempt patch on conflict (409)
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 409 && name) {
        try {
          await k8sPatch(opts.resource, name, resolved, opts.namespace);
          logger.success(`Patched ${opts.resource}/${name} in ${opts.namespace} (already existed)`);
        } catch (patchErr) {
          logger.error(`Failed to patch ${opts.resource}/${name}: ${(patchErr as Error).message}`);
          process.exit(1);
        }
      } else {
        logger.error(`Failed to create ${opts.resource}${name ? `/${name}` : ''}: ${(err as Error).message}`);
        process.exit(1);
      }
    }
  }
}
