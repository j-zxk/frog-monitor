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
