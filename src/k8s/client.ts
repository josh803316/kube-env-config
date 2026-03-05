import { KubeConfig, type ApiType } from '@kubernetes/client-node';
import type { ApiConstructor } from './resources.js';

let _kc: KubeConfig | null = null;

function getKubeConfig(): KubeConfig {
  if (!_kc) {
    _kc = new KubeConfig();
    _kc.loadFromDefault();
  }
  return _kc;
}

export function makeApiClient<T extends ApiType>(ctor: ApiConstructor): T {
  return getKubeConfig().makeApiClient(ctor as new () => T) as T;
}
