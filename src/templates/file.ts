import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';

export function readTemplateFromFile(filePath: string): unknown {
  if (!existsSync(filePath)) {
    throw new Error(`Manifest file not found: ${filePath}`);
  }

  const content = readFileSync(filePath, 'utf-8');

  if (filePath.endsWith('.json')) {
    return JSON.parse(content);
  }

  return parseYaml(content);
}

export function findManifestFile(dir: string, resource: string, name?: string): string | null {
  const candidates = name
    ? [`${resource}-${name}.yaml`, `${resource}-${name}.yml`, `${resource}-${name}.json`]
    : [`${resource}.yaml`, `${resource}.yml`, `${resource}.json`];

  for (const candidate of candidates) {
    const fullPath = join(dir, candidate);
    if (existsSync(fullPath)) return fullPath;
  }
  return null;
}
