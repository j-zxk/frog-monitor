import { IMetrics, IMetricsObj } from '../types';
import { metricsName } from '../constants';

class MetricsStore {
  store: Map<metricsName | string, IMetrics>;

  constructor() {
    this.store = new Map<metricsName | string, IMetrics>();
  }

  set(key: metricsName | string, value: IMetrics) {
    this.store.set(key, value);
  }

  get(key: metricsName | string): IMetrics {
    const value = this.store.get(key);
    return value ? JSON.parse(JSON.stringify(value)) : undefined;
  }

  has(key: metricsName | string): boolean {
    return this.store.has(key);
  }

  clear() {
    this.store.clear();
  }

  getValues(): IMetricsObj {
    const obj: IMetricsObj = {};
    for (const [key, value] of this.store) {
      obj[key] = value;
    }
    return obj;
  }
}

export default MetricsStore;
