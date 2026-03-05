import { k8sHealthCheck } from '../../k8s/operations.js';
import { logger } from '../../logger.js';
import { HEALTH_CHECK_INTERVAL_MS, HEALTH_CHECK_DEFAULT_TIMEOUT_MS } from '../../config/defaults.js';

interface HealthCheckOptions {
  namespace: string;
  name: string;
  timeout?: number;
}

interface DeploymentStatus {
  spec?: { replicas?: number };
  status?: {
    readyReplicas?: number;
    availableReplicas?: number;
    conditions?: Array<{ type: string; status: string; reason?: string; message?: string }>;
  };
}

export async function runHealthCheck(opts: HealthCheckOptions): Promise<void> {
  const timeoutMs = (opts.timeout ?? HEALTH_CHECK_DEFAULT_TIMEOUT_MS / 1000) * 1000;
  const startTime = Date.now();

  logger.info(`Health check: ${opts.name} in ${opts.namespace} (timeout ${timeoutMs / 1000}s)`);

  while (Date.now() - startTime < timeoutMs) {
    const result = (await k8sHealthCheck(opts.name, opts.namespace)) as DeploymentStatus;

    if (!result || typeof result !== 'object') {
      throw new Error(`No deployment found: ${opts.name}`);
    }

    if ('code' in result) {
      throw new Error(`No deployment found: ${opts.name}`);
    }

    const conditions = result.status?.conditions ?? [];
    const progressing = conditions.find((c) => c.type === 'Progressing');

    if (progressing?.status === 'False' && progressing.reason === 'ProgressDeadlineExceeded') {
      throw new Error(`Deployment ${opts.name} exceeded progress deadline.`);
    }

    const newReplicaSetAvailable =
      progressing?.status === 'True' && progressing.reason === 'NewReplicaSetAvailable';

    const replicasReady = result.status?.readyReplicas === result.spec?.replicas;
    const replicasAvailable = result.status?.availableReplicas === result.spec?.replicas;

    if (replicasReady && replicasAvailable && newReplicaSetAvailable) {
      logger.success(`Deployment ${opts.name} is healthy`);
      return;
    }

    logger.debug(
      `Waiting... ready=${result.status?.readyReplicas}/${result.spec?.replicas} ` +
        `available=${result.status?.availableReplicas}/${result.spec?.replicas}`
    );

    await new Promise((r) => setTimeout(r, HEALTH_CHECK_INTERVAL_MS));
  }

  throw new Error(`Health check timed out after ${timeoutMs / 1000}s`);
}
