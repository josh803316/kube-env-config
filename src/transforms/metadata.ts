const STRIP_KEYS = ['creationTimestamp', 'resourceVersion', 'uid', 'selfLink', 'generation', 'managedFields'];

export function stripMetadata(resource: unknown): unknown {
  return deepStrip(resource, STRIP_KEYS);
}

function deepStrip(obj: unknown, keys: string[]): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map((item) => deepStrip(item, keys));

  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (keys.includes(k)) continue;
    result[k] = deepStrip(v, keys);
  }
  return result;
}
