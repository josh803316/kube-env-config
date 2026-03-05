import type { TransformContext, TransformFn } from '../config/types.js';
import { stripMetadata } from './metadata.js';
import { replaceNamespace } from './namespace.js';

export async function applyTransforms(
  resource: unknown,
  ctx: TransformContext,
  userTransform?: TransformFn
): Promise<unknown> {
  let result = stripMetadata(resource);
  result = replaceNamespace(result, ctx.namespace);

  if (ctx.image) {
    result = applyImage(result, ctx.image);
  }

  if (userTransform) {
    result = await userTransform(result, ctx);
  }

  return result;
}

function applyImage(resource: unknown, image: string): unknown {
  if (typeof resource !== 'object' || resource === null) return resource;

  const obj = resource as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(obj)) {
    if (k === 'containers' && Array.isArray(v)) {
      result[k] = v.map((container) => {
        if (typeof container === 'object' && container !== null) {
          return { ...(container as object), image };
        }
        return container;
      });
    } else if (typeof v === 'object' && v !== null) {
      result[k] = applyImage(v, image);
    } else {
      result[k] = v;
    }
  }

  return result;
}
