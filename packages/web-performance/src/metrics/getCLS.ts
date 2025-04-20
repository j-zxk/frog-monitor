import { LayoutShift, IReportHandler, IMetrics } from '../types';
import { onHidden } from '../lib/onHidden';
import { metricsName } from '../constants';
import { roundByFour } from '../utils';
import calcScore from '../lib/calculateScore';

const getCLS = (cls): PerformanceObserver | undefined => {
  if (!window.PerformanceObserver) {
    console.warn('browser do not support performanceObserver');
    return;
  }

  const po: PerformanceObserver = new PerformanceObserver((l) =>
    l.getEntries().map((entry: LayoutShift) => {
      if (!entry.hadRecentInput) {
        cls.value += entry.value;
      }
    }),
  );

  po.observe({ type: 'layout-shift', buffered: true });

  return po;
};

/**
 * @param {metricsStore} store
 * @param {Function} report
 * @param {boolean} immediately, if immediately is true,data will report immediately
 * @param {IScoreConfig} scoreConfig
 * */
export const initCLS = (store, report: IReportHandler, immediately = true, scoreConfig): void => {
  const cls = { value: 0 };

  const po = getCLS(cls);

  const stopListening = () => {
    if (po?.takeRecords) {
      po.takeRecords().map((entry: LayoutShift) => {
        if (!entry.hadRecentInput) {
          cls.value += entry.value;
        }
      });
    }
    po?.disconnect();

    const metrics = {
      name: metricsName.CLS,
      value: roundByFour(cls.value),
      store: calcScore(metricsName.CLS, cls.value, scoreConfig),
    } as IMetrics;

    store.set(metricsName.CLS, metrics);

    if (immediately) {
      report(metrics);
    }
  };

  onHidden(stopListening, true);
};
