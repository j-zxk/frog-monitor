import { breadcrumb, transportData } from 'frog-monitor-core';
import { BreadCrumbTypes, ErrorTypes } from 'frog-monitor-shared';
import { TNumStrObj } from 'frog-monitor-types';
import {
  extractErrorStack,
  getCurrentRoute,
  getLocationHref,
  getTimestamp,
  isError,
  isWxMiniEnv,
  Severity,
  unknownToString,
} from 'frog-monitor-utils';

interface LogTypes {
  message: TNumStrObj;
  tag?: TNumStrObj;
  level?: Severity;
  ex: Error | any;
  type: string;
}

export function log({
  message = 'emptyMsg',
  tag = '',
  level = Severity.Critical,
  ex = '',
  type = ErrorTypes.LOG_ERROR,
}: LogTypes): void {
  let errorInfo = {};
  if (isError(ex)) {
    errorInfo = extractErrorStack(ex, level);
  }
  const error = {
    type,
    level,
    message: unknownToString(message),
    name: 'Monitor.log',
    customTag: unknownToString(tag),
    time: getTimestamp(),
    url: isWxMiniEnv ? getCurrentRoute() : getLocationHref(),
    ...errorInfo,
  };
  breadcrumb.push({
    type: BreadCrumbTypes.CUSTOMER,
    category: breadcrumb.getCategory(BreadCrumbTypes.CUSTOMER),
    data: message,
    level: Severity.fromString(level.toString()),
  });
  transportData.send(error);
}
