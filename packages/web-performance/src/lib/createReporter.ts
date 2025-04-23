import { IMetrics, IMetricsObj, IReportData, IReportHandler } from '../types';

const createReporter =
  (sessionId: string, appId: string, version: string, callback: Function): IReportHandler =>
  (data: IMetrics | IMetricsObj) => {
    const reportData: IReportData = {
      sessionId,
      appId,
      version,
      data,
      timestamp: new Date().getTime(),
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(
        () => {
          callback(reportData);
        },
        { timeout: 3000 },
      );
    } else {
      callback(reportData);
    }
  };

export default createReporter;
