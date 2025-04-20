/**
 * Page loads waterfall stream
 * dns lookup = domainLookupEnd - domainLookupStart
 * initial connection = connectEnd - connectStart
 * ssl = connectEnd - secureConnectionStart
 * ttfb = responseStart - requestStart
 * content download = responseEnd - responseStart
 * dom parse = domInteractive - responseEnd
 * defer execute duration = domContentLoadedEventStart - domInteractive
 * domContentLoadedCallback = domContentLoadedEventEnd - domContentLoadedEventStart
 * resource load = loadEventStart - domContentLoadedEventEnd
 * dom Ready = domContentLoadedEventEnd - fetchStart
 * page load = loadEventStart - fetchStart
 * */
import { metricsName } from '../constants';
import { IMetrics } from '../types';
import { roundByFour, validNumber } from '../utils';
import { isPerformanceObserverSupported, isPerformanceSupported } from '../utils/isSupported';

const getNavigationTiming = () => {
  if (!isPerformanceSupported()) {
    console.warn('browser do not support performance');
    return;
  }

  const resolveNavigationTiming = (entry: PerformanceNavigationTiming, resolve): void => {
    const {
      domainLookupStart,
      domainLookupEnd,
      connectStart,
      connectEnd,
      secureConnectionStart,
      requestStart,
      responseStart,
      responseEnd,
      domInteractive,
      domContentLoadedEventStart,
      domContentLoadedEventEnd,
      loadEventStart,
      fetchStart,
    } = entry;

    resolve({
      dnsLookUp: roundByFour(domainLookupEnd - domainLookupStart),
      initialConnection: roundByFour(connectEnd - connectStart),
      ssl: secureConnectionStart ? roundByFour(connectEnd - secureConnectionStart) : 0,
      ttfb: roundByFour(responseStart - requestStart),
      contentDownload: roundByFour(responseEnd - responseStart),
      domParse: roundByFour(domInteractive - responseEnd),
      deferExecuteDuration: roundByFour(domContentLoadedEventStart - domInteractive),
      domContentLoadedCallback: roundByFour(domContentLoadedEventEnd - domContentLoadedEventStart),
      resourceLoad: roundByFour(loadEventStart - domContentLoadedEventEnd),
      domReady: roundByFour(domContentLoadedEventEnd - fetchStart),
      pageLoad: roundByFour(loadEventStart - fetchStart),
    });
  };

  return new Promise((resolve) => {
    if (
      isPerformanceObserverSupported() &&
      PerformanceObserver.supportedEntryTypes?.includes('navigation')
    ) {
      const po: PerformanceObserver = new PerformanceObserver((l) => {
        l.getEntries().map((entry: PerformanceNavigationTiming) => {
          if (entry.entryType === 'navigation') {
            if (po) {
              po.disconnect();
            }

            resolveNavigationTiming(entry, resolve);
          }
        });
      });

      po.observe({ type: 'navigation', buffered: true });
    } else {
      const navigation =
        performance.getEntriesByType('navigation').length > 0
          ? performance.getEntriesByType('navigation')[0]
          : performance.timing;
      resolveNavigationTiming(navigation as PerformanceNavigationTiming, resolve);
    }
  });
};

/**
 * @param {metricsStore} store
 * @param {Function} report
 * @param {boolean} immediately, if immediately is true,data will report immediately
 * */
export const initNavigationTiming = (store, report, immediately = true): void => {
  getNavigationTiming()?.then((navigationTiming) => {
    const metrics = { name: metricsName.NT, value: navigationTiming } as IMetrics;

    if (validNumber(Object?.values(metrics.value))) {
      store.set(metricsName.NT, metrics);

      if (immediately) {
        report(metrics);
      }
    }
  });
};
