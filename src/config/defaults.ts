export const DEFAULT_PROTECTED_NAMESPACES = [
  'aws-addons',
  'amazon-cloudwatch',
  'cert-manager',
  'default',
  'external-dns',
  'istio-system',
  'ingress-nginx',
  'kube-system',
  'kube-public',
  'kube-node-lease',
  'kube-flannel',
  'kube-proxy',
  'kubernetes-dashboard',
  'linkerd',
  'logging',
  'monitoring',
] as const;

export const DEFAULT_PROTECTED_ENVIRONMENTS = ['prod', 'preprod'] as const;

export const HEALTH_CHECK_INTERVAL_MS = 10_000;
export const HEALTH_CHECK_DEFAULT_TIMEOUT_MS = 420_000;
