import { HttpTypes } from 'frog-monitor-shared';

export interface IAnyObject {
  [key: string]: any;
}

export interface ResourceErrorTarget {
  src?: string;
  href?: string;
  localName?: string;
}

export type TNumStrObj = number | string | object;

export interface MonitorHttp {
  type: HttpTypes;
  traceId?: string;
  method?: string;
  url?: string;
  status?: number;
  reqData?: any;
  sTime?: number;
  elapsedTime?: number;
  responseText?: string;
  time?: number;
  isSdkUrl?: boolean;
  // for wx
  errMsg?: string;
}

export interface MonitorXMLHttpRequest extends XMLHttpRequest {
  [key: string]: any;
  monitor_xhr?: MonitorHttp;
}
