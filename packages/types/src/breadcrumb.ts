import { BreadCrumbTypes } from 'frog-monitor-shared';
import { ReportDataType } from './transportData';
import { Replace } from './replace';
import { TNumStrObj } from './common';
import { Severity } from 'frog-monitor-utils';

export interface BreadcrumbPushData {
  /**
   * 事件类型
   */
  type: BreadCrumbTypes;
  data: ReportDataType | Replace.TriggerConsole | Replace.IRouter | TNumStrObj;
  category?: string;
  time?: number;
  level: Severity;
}
