import { metricsName } from '../constants';
import calcScore from '../lib/calculateScore';
import getFirstHiddenTime from '../lib/getFirstHiddenTime';
import { onHidden } from '../lib/onHidden';
import { IMetrics } from '../types';
import { roundByFour } from '../utils';

const getFID = (): Promise<PerformanceEntry> | undefined => {
  if (!window.PerformanceObserver) {
    console.warn('browser do not support performanceObserver');
    return;
  }

  const firstHiddenTime = getFirstHiddenTime();

  return new Promise((resolve) => {
    const eventHandler = (entry: PerformanceEventTiming) => {
      if (entry.startTime < firstHiddenTime.timeStamp) {
        if (po) {
          po.disconnect();
        }

        resolve(entry);
      }
    };

    const po: PerformanceObserver = new PerformanceObserver((l) =>
      l.getEntries().map(eventHandler),
    );

    po.observe({ type: 'first-input', buffered: true });

    if (po) {
      onHidden(() => {
        if (po?.takeRecords) {
          po.takeRecords().map(eventHandler);
        }
        po.disconnect();
      }, true);
    }
  });
};

/**
 * @param {metricsStore} store
 * @param {Function} report
 * @param {boolean} immediately, if immediately is true,data will report immediately
 * @param {IScoreConfig} scoreConfig
 * */
export const initFID = (store, report, immediately = true, scoreConfig): void => {
  getFID()?.then((entry: PerformanceEventTiming) => {
    const metrics = {
      name: metricsName.FID,
      value: {
        eventName: entry.name,
        targetCls: entry.target?.nodeName, // className?nodeName?
        startTime: roundByFour(entry.startTime, 2),
        delay: roundByFour(entry.processingStart - entry.startTime, 2),
        eventHandleTime: roundByFour(entry.processingEnd - entry.processingStart, 2),
      },
      score: calcScore(
        metricsName.FID,
        roundByFour(entry.processingStart - entry.startTime, 2),
        scoreConfig,
      ),
    } as IMetrics;

    store.set(metricsName.FID, metrics);

    if (immediately) {
      report(metrics);
    }
  });
};
