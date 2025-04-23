export interface IConfig {
  appId?: string;
  version?: string;
  reportCallback: Function;
  immediately: boolean;
  isCustomEvent?: boolean;
  logFpsCount?: number;
  apiConfig?: {
    [prop: string]: Array<string>;
  };
  hashHistory?: boolean;
  excludeRemotePath?: Array<string>;
  maxWaitCCPDuration: number;
  scoreConfig?: IScoreConfig;
}
export interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export interface IMetrics {
  name: string;
  value: any;
  score?: number;
}

export interface IReportHandler {
  (metrics: IMetrics | IMetricsObj): void;
}

export interface IMetricsObj {
  [prop: string]: IMetrics;
}

export interface OnHiddenCallback {
  (event: Event): void;
}

export interface Curve {
  median: number;
  podr?: number;
  p10?: number;
}

export interface IScoreConfig {
  [prop: string]: { median: number; p10: number };
}

export interface IReportData {
  sessionId: string;
  appId?: string;
  version?: string;
  data: IMetrics | IMetricsObj;
  timestamp: number;
}

declare global {
  interface Window {
    // Build flags:
    __monitor_xhr__: boolean;
    __monitor_fetch__: boolean;
    __monitor_sessionId__: string;
  }
}
