#!/usr/bin/env bun
import { Command } from '@commander-js/extra-typings';
import { runCreate } from './commands/create.js';
import { runDelete } from './commands/delete.js';
import { runRead } from './commands/read.js';
import { runList } from './commands/list.js';
import { runPatch } from './commands/patch.js';
import { runHealthCheck } from './commands/health-check.js';
import { RESOURCE_TYPES } from '../k8s/resources.js';
import { logger } from '../logger.js';

const program = new Command()
  .name('kec')
  .description('Kubernetes environment config CLI')
  .version('1.0.0');

// ── create ─────────────────────────────────────────────────────────────────
program
  .command('create')
  .description('Create or update Kubernetes resources from template')
  .requiredOption('-r, --resource <type>', `Resource type (${RESOURCE_TYPES.join(', ')})`)
  .requiredOption('-n, --namespace <ns>', 'Target namespace')
  .option('-s, --service <name>', 'Service name (filters allowedResources from config)')
  .option('--image <ref>', 'Container image reference (e.g. nginx:latest)')
  .option('--manifest <file>', 'Path to local YAML/JSON manifest file')
  .option('--dry-run', 'Print resolved manifests without applying')
  .option('-e, --environment <env>', 'Environment name')
  .action(async (opts) => {
    await runCreate({
      resource: opts.resource,
      namespace: opts.namespace,
      service: opts.service,
      image: opts.image,
      manifest: opts.manifest,
      dryRun: opts.dryRun,
      environment: opts.environment,
    }).catch(handleError);
  });

// ── delete ─────────────────────────────────────────────────────────────────
program
  .command('delete')
  .description('Delete Kubernetes resources in a namespace')
  .requiredOption('-r, --resource <type>', `Resource type (${RESOURCE_TYPES.join(', ')})`)
  .requiredOption('-n, --namespace <ns>', 'Target namespace')
  .option('-s, --service <name>', 'Service name')
  .option('-e, --environment <env>', 'Environment name')
  .option('--dry-run', 'Print what would be deleted without applying')
  .action(async (opts) => {
    await runDelete({
      resource: opts.resource,
      namespace: opts.namespace,
      service: opts.service,
      environment: opts.environment,
      dryRun: opts.dryRun,
    }).catch(handleError);
  });

// ── read ────────────────────────────────────────────────────────────────────
program
  .command('read')
  .description('Read a single Kubernetes resource')
  .requiredOption('-r, --resource <type>', `Resource type (${RESOURCE_TYPES.join(', ')})`)
  .requiredOption('-n, --namespace <ns>', 'Namespace')
  .requiredOption('--name <name>', 'Resource name')
  .action(async (opts) => {
    await runRead({
      resource: opts.resource,
      namespace: opts.namespace,
      name: opts.name,
    }).catch(handleError);
  });

// ── list ────────────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List Kubernetes resources in a namespace')
  .requiredOption('-r, --resource <type>', `Resource type (${RESOURCE_TYPES.join(', ')})`)
  .requiredOption('-n, --namespace <ns>', 'Namespace')
  .action(async (opts) => {
    await runList({
      resource: opts.resource,
      namespace: opts.namespace,
    }).catch(handleError);
  });

// ── patch ────────────────────────────────────────────────────────────────────
program
  .command('patch')
  .description('Patch a Kubernetes resource with a manifest file')
  .requiredOption('-r, --resource <type>', `Resource type (${RESOURCE_TYPES.join(', ')})`)
  .requiredOption('-n, --namespace <ns>', 'Namespace')
  .requiredOption('--name <name>', 'Resource name')
  .requiredOption('--manifest <file>', 'Path to patch YAML/JSON file')
  .option('--dry-run', 'Print patch body without applying')
  .action(async (opts) => {
    await runPatch({
      resource: opts.resource,
      namespace: opts.namespace,
      name: opts.name,
      manifest: opts.manifest,
      dryRun: opts.dryRun,
    }).catch(handleError);
  });

// ── health-check ────────────────────────────────────────────────────────────
program
  .command('health-check')
  .description('Poll deployment status until healthy or timeout')
  .requiredOption('-n, --namespace <ns>', 'Namespace')
  .requiredOption('--name <name>', 'Deployment name')
  .option('--timeout <seconds>', 'Timeout in seconds', (v) => parseInt(v, 10))
  .action(async (opts) => {
    await runHealthCheck({
      namespace: opts.namespace,
      name: opts.name,
      timeout: opts.timeout,
    }).catch(handleError);
  });

program.parse();

function handleError(err: unknown): never {
  logger.error((err as Error).message ?? String(err));
  process.exit(1);
}
