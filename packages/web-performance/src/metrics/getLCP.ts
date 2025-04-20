import { metricsName } from '../constants';
import calcScore from '../lib/calculateScore';
import getFirstHiddenTime from '../lib/getFirstHiddenTime';
import { onHidden } from '../lib/onHidden';
import { IMetrics } from '../types';
import { roundByFour } from '../utils';

const getLCP = (lcp) => {
  if (!window.PerformanceObserver) {
    console.warn('browser do not support performanceObserver');
    return;
  }

  const firstHiddenTime = getFirstHiddenTime();

  const po: PerformanceObserver = new PerformanceObserver((l) =>
    l.getEntries().map((entry: PerformanceEntry) => {
      if (entry.startTime < firstHiddenTime.timeStamp) {
        lcp.value = entry;
      }
    }),
  );

  po.observe({ type: 'largest-contentful-paint', buffered: true });
  return po;
};

/**
 * @param {metricsStore} store
 * @param {Function} report
 * @param {boolean} immediately, if immediately is true,data will report immediately
 * @param {IScoreConfig} scoreConfig
 * */
export const initLCP = (store, report, immediately = true, scoreConfig) => {
  const lcp = { value: {} as PerformanceEntry };
  const po = getLCP(lcp);

  const stopListening = () => {
    if (po) {
      if (po?.takeRecords) {
        po.takeRecords().map((entry: PerformanceEntry) => {
          const firstHiddenTime = getFirstHiddenTime();
          if (entry.startTime < firstHiddenTime.timeStamp) {
            lcp.value = entry;
          }
        });
      }
      po?.disconnect();

      if (!store.has(metricsName.LCP)) {
        const value = lcp.value;
        const metrice = {
          name: metricsName.LCP,
          value: roundByFour(value.startTime, 2),
          score: calcScore(metricsName.LCP, value.startTime, scoreConfig),
        } as IMetrics;

        store.set(metricsName.LCP, metrice);

        if (immediately) {
          report(metrice);
        }
      }
    }
  };

  onHidden(stopListening, true);
  ['click', 'keydown'].forEach((event: string) => {
    addEventListener(event, stopListening, { once: true, capture: true });
  });
};
