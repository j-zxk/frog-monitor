import { ErrorTypes, EventTypes } from 'frog-monitor-shared';
import { ReportDataType } from 'frog-monitor-types';
import { variableTypeDetection } from 'frog-monitor-utils';
import { options } from './options';

const allErrorNumber: unknown = {};
/**
 * generate error unique Id
 * @param data
 */
export function createErrorId(data: ReportDataType, apikey: string): number | null {
  let id: any;
  switch (data.type) {
    case ErrorTypes.FETCH_ERROR:
      id =
        data.type +
        data.request.method +
        data.response.status +
        getRealPath(data.request.url) +
        apikey;
      break;
    case ErrorTypes.JAVASCRIPT_ERROR:
    case ErrorTypes.REACT_ERROR:
    case ErrorTypes.VUE_ERROR:
      id = data.type + data.name + data.message + apikey;
      break;
    case ErrorTypes.LOG_ERROR:
      id = data.customTag + data.type + data.name + apikey;
    case ErrorTypes.PROMISE_ERROR:
      id = generatePromiseErrorId(data, apikey);
      break;
    default:
      id = data.type + data.message + apikey;
      break;
  }
  id = hashCode(id);
  if (allErrorNumber[id] >= options.maxDuplicateCount) {
    return null;
  }
  if (typeof allErrorNumber[id] === 'number') {
    allErrorNumber[id]++;
  } else {
    allErrorNumber[id] = 1;
  }

  return id;
}

function generatePromiseErrorId(data: ReportDataType, apikey: string) {
  const locationUrl = getRealPath(data.url);
  if (data.name === EventTypes.UNHANDLEDREJECTION) {
    return data.type + objectOrder(data.message) + apikey;
  }
  return data.type + data.name + objectOrder(data.message) + locationUrl;
}

function objectOrder(reason: any) {
  const sortFn = (obj: any) => {
    return Object.keys(obj)
      .sort()
      .reduce((total, key) => {
        if (variableTypeDetection.isObject(obj[key])) {
          total[key] = sortFn(obj[key]);
        } else {
          total[key] = obj[key];
        }
        return total;
      }, {});
  };
  try {
    if (/\{.*\}/.test(reason)) {
      let obj = JSON.parse(reason);
      obj = sortFn(obj);
      return JSON.stringify(obj);
    }
  } catch (error) {
    return reason;
  }
}

/**
 * http://.../project?id=1#a => http://.../project
 * http://.../id/123=> http://.../id/{param}
 *
 * @param url
 */
export function getRealPath(url: string): string {
  return url.replace(/[\?#].*$/, '').replace(/\/\d+([\/]*$)/, '{param}$1');
}

export function hashCode(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}
