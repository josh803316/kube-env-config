import {
  AppsV1Api,
  CoreV1Api,
  NetworkingV1Api,
  RbacAuthorizationV1Api,
  type ApiType,
} from '@kubernetes/client-node';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiConstructor = new (...args: any[]) => ApiType;

export interface ResourceConfig {
  api: ApiConstructor;
  clusterScoped?: boolean;
  operations: {
    read?: string;
    list?: string;
    create?: string;
    patch?: string;
    delete?: string;
    deleteCollection?: string;
    healthCheck?: string;
  };
}

export const RESOURCE_TYPES = [
  'namespace',
  'configmap',
  'secret',
  'ingress',
  'serviceaccount',
  'role',
  'rolebinding',
  'deployment',
  'pv',
  'pvc',
  'service',
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export function isResourceType(s: string): s is ResourceType {
  return (RESOURCE_TYPES as readonly string[]).includes(s);
}

export const resourceRegistry: Record<string, ResourceConfig> = {
  namespace: {
    api: CoreV1Api,
    clusterScoped: true,
    operations: {
      read: 'readNamespace',
      list: 'listNamespace',
      create: 'createNamespace',
      patch: 'patchNamespace',
      delete: 'deleteNamespace',
    },
  },
  configmap: {
    api: CoreV1Api,
    operations: {
      read: 'readNamespacedConfigMap',
      list: 'listNamespacedConfigMap',
      create: 'createNamespacedConfigMap',
      patch: 'patchNamespacedConfigMap',
      delete: 'deleteNamespacedConfigMap',
      deleteCollection: 'deleteCollectionNamespacedConfigMap',
    },
  },
  secret: {
    api: CoreV1Api,
    operations: {
      read: 'readNamespacedSecret',
      list: 'listNamespacedSecret',
      create: 'createNamespacedSecret',
      patch: 'patchNamespacedSecret',
      delete: 'deleteNamespacedSecret',
      deleteCollection: 'deleteCollectionNamespacedSecret',
    },
  },
  ingress: {
    api: NetworkingV1Api,
    operations: {
      read: 'readNamespacedIngress',
      list: 'listNamespacedIngress',
      create: 'createNamespacedIngress',
      patch: 'patchNamespacedIngress',
      delete: 'deleteNamespacedIngress',
      deleteCollection: 'deleteCollectionNamespacedIngress',
    },
  },
  serviceaccount: {
    api: CoreV1Api,
    operations: {
      read: 'readNamespacedServiceAccount',
      list: 'listNamespacedServiceAccount',
      create: 'createNamespacedServiceAccount',
      patch: 'patchNamespacedServiceAccount',
      delete: 'deleteNamespacedServiceAccount',
    },
  },
  role: {
    api: RbacAuthorizationV1Api,
    operations: {
      read: 'readNamespacedRole',
      list: 'listNamespacedRole',
      create: 'createNamespacedRole',
      patch: 'patchNamespacedRole',
      delete: 'deleteNamespacedRole',
    },
  },
  rolebinding: {
    api: RbacAuthorizationV1Api,
    operations: {
      read: 'readNamespacedRoleBinding',
      list: 'listNamespacedRoleBinding',
      create: 'createNamespacedRoleBinding',
      patch: 'patchNamespacedRoleBinding',
      delete: 'deleteNamespacedRoleBinding',
    },
  },
  deployment: {
    api: AppsV1Api,
    operations: {
      read: 'readNamespacedDeployment',
      list: 'listNamespacedDeployment',
      create: 'createNamespacedDeployment',
      patch: 'patchNamespacedDeployment',
      delete: 'deleteNamespacedDeployment',
      deleteCollection: 'deleteCollectionNamespacedDeployment',
      healthCheck: 'readNamespacedDeploymentStatus',
    },
  },
  pv: {
    api: CoreV1Api,
    clusterScoped: true,
    operations: {
      read: 'readPersistentVolume',
      list: 'listPersistentVolume',
      create: 'createPersistentVolume',
      patch: 'patchPersistentVolume',
      delete: 'deletePersistentVolume',
    },
  },
  pvc: {
    api: CoreV1Api,
    operations: {
      read: 'readNamespacedPersistentVolumeClaim',
      list: 'listNamespacedPersistentVolumeClaim',
      create: 'createNamespacedPersistentVolumeClaim',
      patch: 'patchNamespacedPersistentVolumeClaim',
      delete: 'deleteNamespacedPersistentVolumeClaim',
      deleteCollection: 'deleteCollectionNamespacedPersistentVolumeClaim',
    },
  },
  service: {
    api: CoreV1Api,
    operations: {
      read: 'readNamespacedService',
      list: 'listNamespacedService',
      create: 'createNamespacedService',
      patch: 'patchNamespacedService',
      delete: 'deleteNamespacedService',
      deleteCollection: 'deleteCollectionNamespacedService',
    },
  },
};
