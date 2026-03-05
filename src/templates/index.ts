import type { KecConfig } from '../config/types.js';
import { readTemplatesFromNamespace } from './namespace.js';
import { readTemplateFromFile, findManifestFile } from './file.js';

export async function resolveTemplates(
  resource: string,
  config: KecConfig | null,
  opts: { manifestFile?: string; name?: string }
): Promise<unknown[]> {
  if (opts.manifestFile) {
    const template = readTemplateFromFile(opts.manifestFile);
    return [template];
  }

  if (!config) {
    throw new Error('No kec.config.ts and no --manifest provided');
  }

  if (config.templateSource.type === 'namespace') {
    return readTemplatesFromNamespace(resource, config.templateSource.namespace);
  }

  // File-based template source
  const dir = config.templateSource.dir;
  const filePath = findManifestFile(dir, resource, opts.name);
  if (!filePath) {
    throw new Error(`No manifest found for ${resource} in ${dir}`);
  }
  const template = readTemplateFromFile(filePath);
  return [template];
}
