/**
 * Performance monitoring entry
 * */
import { IConfig, IMetrics } from './types';
import MetricsStore from './lib/store';
import createReporter from './lib/createReporter';
import generateUniqueID from './utils/generateUniqueID';
import { initNavigationTiming } from './metrics/getNavigationTiming';
import { initCLS } from './metrics/getCLS';
import { initFID } from './metrics/getFID';
import { initLCP } from './metrics/getLCP';
import { afterLoad, beforeUnload, unload } from './utils';
import { onHidden } from './lib/onHidden';
import { clearMark, getMark, hasMark, setMark } from './lib/markHandler';
import { measure } from './lib/measureCustomMetrics';

let metricsStore: MetricsStore;
let reporter: ReturnType<typeof createReporter>;

class WebVitals {
  immediately: boolean;

  constructor(config: IConfig) {
    const {
      appId,
      version,
      reportCallback,
      immediately = false,
      isCustomEvent = false,
      logFpsCount = 5,
      apiConfig = {},
      hashHistory = true,
      excludeRemotePath = [],
      maxWaitCCPDuration = 30 * 1000,
      scoreConfig = {},
    } = config;

    this.immediately = immediately;

    const sessionId = generateUniqueID();
    window.__monitor_sessionId__ = sessionId;
    reporter = createReporter(sessionId, appId, version, reportCallback);
    metricsStore = new MetricsStore();

    initCLS(metricsStore, reporter, immediately, scoreConfig);
    initLCP(metricsStore, reporter, immediately, scoreConfig);

    afterLoad(() => {
      initNavigationTiming(metricsStore, reporter, immediately);
      initFID(metricsStore, reporter, immediately, scoreConfig);
    });

    // if immediately is false,report metrics when visibility and unload
    [beforeUnload, unload, onHidden].forEach((fn) => {
      fn(() => {
        const metrics = this.getCurrentMetrics();
        if (Object.keys(metrics).length > 0 && !immediately) {
          reporter(metrics);
        }
      });
    });
  }

  getCurrentMetrics() {
    return metricsStore.getValues();
  }

  setStartMark(markName: string) {
    setMark(`${markName}_start`);
  }

  setEndMark(markName: string) {
    setMark(`${markName}_end`);

    if (hasMark(`${markName}_start`)) {
      const value = measure(`${markName}Metrics`, markName);
      this.clearMark(markName);

      const metrics = { name: `${markName}Metrics`, value } as IMetrics;

      metricsStore.set(`${markName}Metrics`, metrics);

      if (this.immediately) {
        reporter(metrics);
      }
    } else {
      const value = getMark(`${markName}_end`)?.startTime;
      this.clearMark(markName);

      const metrics = { name: `${markName}Metrics`, value } as IMetrics;

      metricsStore.set(`${markName}Metrics`, metrics);

      if (this.immediately) {
        reporter(metrics);
      }
    }
  }

  clearMark(markName: string) {
    clearMark(`${markName}_start`);
    clearMark(`${markName}_end`);
  }
}

export { WebVitals };
