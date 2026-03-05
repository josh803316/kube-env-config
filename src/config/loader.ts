import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { KecConfig, KecConfigSchema } from './types.js';
import { logger } from '../logger.js';

const CONFIG_FILES = ['kec.config.ts', 'kec.config.js', '.kec/config.ts', '.kec/config.js'];

function findConfigFile(startDir: string): string | null {
  let dir = startDir;
  while (true) {
    for (const name of CONFIG_FILES) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export async function loadConfig(cwd = process.cwd()): Promise<KecConfig | null> {
  const configPath = findConfigFile(cwd);
  if (!configPath) {
    logger.debug('No kec.config.ts found, running without project config');
    return null;
  }

  logger.debug(`Loading config from ${configPath}`);
  const mod = await import(configPath);
  const raw = mod.default ?? mod;

  const result = KecConfigSchema.safeParse(raw);
  if (!result.success) {
    logger.error(`Invalid kec.config: ${result.error.message}`);
    process.exit(1);
  }

  return result.data;
}
