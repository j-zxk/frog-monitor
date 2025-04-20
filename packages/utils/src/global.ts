import { Breadcrumb } from 'packages/core/src/breadcrumb';
import { variableTypeDetection } from './is';
import { Logger } from './logger';
import { EventTypes, WxEvents } from 'frog-monitor-shared';
import { DeviceInfo } from 'frog-monitor-types';
import { Options, TransportData } from 'frog-monitor-core';

// Monitor的全局变量
export interface MonitorSupport {
  logger: Logger;
  breadcrumb: Breadcrumb;
  transportData: TransportData;
  replaceFlag: { [key in EventTypes]?: boolean };
  record?: any[];
  deviceInfo?: DeviceInfo;
  options?: Options;
  track?: any;
}

interface MonitorGlobal {
  console?: Console;
  __Monitor__?: MonitorSupport;
}

export const isNodeEnv = variableTypeDetection.isProcess(
  typeof process !== 'undefined' ? process : 0,
);

export const isWxMiniEnv =
  variableTypeDetection.isObject(typeof wx !== 'undefined' ? wx : 0) &&
  variableTypeDetection.isFunction(typeof App !== 'undefined' ? App : 0);

export const isBrowserEnv = variableTypeDetection.isWindow(
  typeof window !== 'undefined' ? window : 0,
);
/**
 * 获取全局变量
 *
 * ../returns Global scope object
 */
export function getGlobal<T>() {
  if (isBrowserEnv) return window as unknown as MonitorGlobal & T;
  if (isWxMiniEnv) return wx as unknown as MonitorGlobal & T;
  if (isNodeEnv) return process as unknown as MonitorGlobal & T;
}

const _global = getGlobal<Window>();
const _support = getGlobalMonitorSupport();

export { _global, _support };

_support.replaceFlag = _support.replaceFlag || {};
const replaceFlag = _support.replaceFlag;
export function setFlag(replaceType: EventTypes | WxEvents, isSet: boolean): void {
  if (replaceFlag[replaceType]) return;
  replaceFlag[replaceType] = isSet;
}

export function getFlag(replaceType: EventTypes | WxEvents): boolean {
  return replaceFlag[replaceType] ? true : false;
}

/**
 * 获取全部变量__Monitor__的引用地址
 *
 * ../returns global variable of Monitor
 */
export function getGlobalMonitorSupport(): MonitorSupport {
  _global.__Monitor__ = _global.__Monitor__ || ({} as MonitorSupport);
  return _global.__Monitor__;
}

export function supportsHistory(): boolean {
  const chrome = (_global as any).chrome;
  const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
  const hasHistoryApi =
    'history' in _global && !!_global.history.pushState && !!_global.history.replaceState;

  return !isChromePackagedApp && hasHistoryApi;
}
