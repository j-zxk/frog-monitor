import { BreadCrumbTypes, EventTypes } from 'frog-monitor-shared';
import { addReplaceHandler } from './replace';
import { HandleEvents } from './handleEvents';
import { breadcrumb, handleConsole } from 'frog-monitor-core';
import { Severity, htmlElementAsString } from 'frog-monitor-utils';

export function setupReplace(): void {
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, BreadCrumbTypes.XHR);
    },
    type: EventTypes.XHR,
  });
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data, BreadCrumbTypes.FETCH);
    },
    type: EventTypes.FETCH,
  });
  addReplaceHandler({
    callback: (error) => {
      HandleEvents.handleError(error);
    },
    type: EventTypes.ERROR,
  });
  addReplaceHandler({
    callback: (data) => {
      handleConsole(data);
    },
    type: EventTypes.CONSOLE,
  });
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHistory(data);
    },
    type: EventTypes.HISTORY,
  });
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHashChange(data);
    },
    type: EventTypes.HASHCHANGE,
  });
  addReplaceHandler({
    callback: (ev) => {
      HandleEvents.handleUnhandleRejection(ev);
    },
    type: EventTypes.UNHANDLEDREJECTION,
  });
  addReplaceHandler({
    callback: (data) => {
      const htmlString = htmlElementAsString(data.data.activeElement as HTMLElement);
      if (htmlString) {
        breadcrumb.push({
          type: BreadCrumbTypes.CLICK,
          category: breadcrumb.getCategory(BreadCrumbTypes.CLICK),
          data: htmlString,
          level: Severity.Info,
        });
      }
    },
    type: EventTypes.DOM,
  });
}
