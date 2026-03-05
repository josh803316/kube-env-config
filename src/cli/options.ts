import type { Command } from '@commander-js/extra-typings';
import { RESOURCE_TYPES } from '../k8s/resources.js';

export function addResourceOption(cmd: Command) {
  return cmd.requiredOption(
    '-r, --resource <type>',
    `Resource type (${RESOURCE_TYPES.join(', ')})`
  );
}

export function addNamespaceOption(cmd: Command) {
  return cmd.requiredOption('-n, --namespace <ns>', 'Target namespace');
}

export function addServiceOption(cmd: Command) {
  return cmd.option('-s, --service <name>', 'Service name (filters to allowedResources from config)');
}

export function addImageOption(cmd: Command) {
  return cmd.option('--image <ref>', 'Container image reference (e.g. nginx:latest)');
}

export function addDryRunOption(cmd: Command) {
  return cmd.option('--dry-run', 'Print resolved manifests without applying');
}

export function addManifestOption(cmd: Command) {
  return cmd.option('--manifest <file>', 'Path to local YAML/JSON manifest file');
}

export function addEnvironmentOption(cmd: Command) {
  return cmd.option('-e, --environment <env>', 'Environment name (used for protection checks)');
}
