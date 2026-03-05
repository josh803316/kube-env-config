export function replaceNamespace(resource: unknown, targetNamespace: string): unknown {
  return deepReplaceNamespace(resource, targetNamespace);
}

function deepReplaceNamespace(obj: unknown, ns: string): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map((item) => deepReplaceNamespace(item, ns));

  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (k === 'namespace' && typeof v === 'string') {
      result[k] = ns;
    } else {
      result[k] = deepReplaceNamespace(v, ns);
    }
  }
  return result;
}
