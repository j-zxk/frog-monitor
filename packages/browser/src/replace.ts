import {
  _global,
  on,
  replaceOld,
  getTimestamp,
  isExistProperty,
  getLocationHref,
  supportsHistory,
  throttle,
} from 'frog-monitor-utils';
import {
  options,
  ReplaceHandler,
  setTraceId,
  subscribeEvent,
  transportData,
  triggerHandlers,
} from 'frog-monitor-core';
import { voidFun, HttpTypes, EventTypes, HttpCodes } from 'frog-monitor-shared';
import { EMethods, MonitorXMLHttpRequest } from 'frog-monitor-types';

function isFilterHttpUrl(url: string) {
  return options.filterXhrUrlRegExp && options.filterXhrUrlRegExp.test(url);
}

function replace(type: EventTypes) {
  switch (type) {
    case EventTypes.XHR:
      xhrReplace();
      break;
    case EventTypes.FETCH:
      fetchReplace();
      break;
    case EventTypes.ERROR:
      listenError();
      break;
    case EventTypes.CONSOLE:
      consoleReplace();
      break;
    case EventTypes.HISTORY:
      historyReplace();
      break;
    case EventTypes.UNHANDLEDREJECTION:
      unhandledrejectionReplace();
      break;
    case EventTypes.DOM:
      domReplace();
      break;
    case EventTypes.HASHCHANGE:
      listenHashChange();
      break;
    default:
      break;
  }
}

export function addReplaceHandler(handler: ReplaceHandler) {
  if (!subscribeEvent(handler)) return;
  replace(handler.type);
}

function xhrReplace(): void {
  if (!('XMLHttpRequest' in _global)) {
    return;
  }
  const originalXhrProto = XMLHttpRequest.prototype;
  replaceOld(originalXhrProto, 'open', (originalOpen: voidFun): voidFun => {
    return function (this, ...args: any[]): void {
      this.monitor_xhr = {
        method: args[0],
        url: args[1],
        sTime: getTimestamp(),
        type: HttpTypes.XHR,
      };
      originalOpen.apply(this, args);
    };
  });
  replaceOld(originalXhrProto, 'send', (originalSend: voidFun): voidFun => {
    return function (this: MonitorXMLHttpRequest, ...args: any[]): void {
      const { method, url } = this.monitor_xhr;
      setTraceId(url, (headerFieldName: string, traceId: string) => {
        this.monitor_xhr.traceId = traceId;
        this.setRequestHeader(headerFieldName, traceId);
      });
      options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method, url }, this);
      on(this, 'loadend', function (this: MonitorXMLHttpRequest) {
        if (
          (method === EMethods.Post && transportData.isSdkTransportUrl(url)) ||
          isFilterHttpUrl(url)
        )
          return;
        const { responseType, response, status } = this;
        this.monitor_xhr.reqData = args[0];
        const eTime = getTimestamp();
        this.monitor_xhr.time = this.monitor_xhr.sTime;
        this.monitor_xhr.status = status;
        if (['', 'json', 'text'].indexOf(responseType) !== -1) {
          this.monitor_xhr.responseText =
            typeof response === 'object' ? JSON.stringify(response) : response;
        }
        this.monitor_xhr.elapsedTime = eTime - this.monitor_xhr.sTime;
        triggerHandlers(EventTypes.XHR, this.monitor_xhr);
      });
      originalSend.apply(this, args);
    };
  });
}

function fetchReplace(): void {
  if (!('fetch' in _global)) {
    return;
  }
  replaceOld(_global, EventTypes.FETCH, (originalFetch: voidFun) => {
    return function (url, config) {
      const sTime = getTimestamp();
      const method = config?.method || 'GET';
      let handlerData: any = {
        method,
        url,
        reqData: config?.body,
        type: HttpTypes.FETCH,
      };
      const headers = new Headers(config.headers || {});
      Object.assign(headers, {
        setRequestHeader: headers.set,
      });
      setTraceId(url, (headerFieldName: string, traceId: string) => {
        handlerData.traceId = traceId;
        headers.set(headerFieldName, traceId);
      });
      options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method, url }, headers);
      config = {
        ...config,
        headers,
      };

      return originalFetch.apply(_global, [url, config]).then(
        (res: Response) => {
          const tempRes = res.clone();
          const eTime = getTimestamp();
          handlerData = {
            ...handlerData,
            elapsedTime: eTime - sTime,
            status: tempRes.status,
            // statusText: tempRes.statusText,
            time: sTime,
          };
          tempRes.text().then((data) => {
            if (method === EMethods.Post && transportData.isSdkTransportUrl(url)) return;
            if (isFilterHttpUrl(url)) return;
            handlerData.responseText = tempRes.status > HttpCodes.UNAUTHORIZED && data;
            triggerHandlers(EventTypes.FETCH, handlerData);
          });
          return res;
        },
        (err: Error) => {
          const eTime = getTimestamp();
          if (method === EMethods.Post && transportData.isSdkTransportUrl(url)) return;
          if (isFilterHttpUrl(url)) return;
          handlerData = {
            ...handlerData,
            elapsedTime: eTime - sTime,
            status: 0,
            // statusText: err.name + err.message,
            time: sTime,
          };
          triggerHandlers(EventTypes.FETCH, handlerData);
          throw err;
        },
      );
    };
  });
}

function listenHashChange(): void {
  if (!isExistProperty(_global, 'onpopstate')) {
    on(_global, EventTypes.HASHCHANGE, function (e: HashChangeEvent) {
      triggerHandlers(EventTypes.HASHCHANGE, e);
    });
  }
}

function listenError(): void {
  on(
    _global,
    EventTypes.ERROR,
    function (e: ErrorEvent) {
      triggerHandlers(EventTypes.ERROR, e);
    },
    true,
  );
}

function consoleReplace(): void {
  if (!('console' in _global)) {
    return;
  }
  const logType = ['log', 'debug', 'info', 'warn', 'error', 'assert'];
  logType.forEach(function (level: string): void {
    if (!(level in _global.console)) {
      return;
    }
    replaceOld(_global.console, level, function (originalConsole: voidFun): voidFun {
      return function (...args: any[]): void {
        if (originalConsole) {
          triggerHandlers(EventTypes.CONSOLE, { args, level });
          originalConsole.apply(_global.console, args);
        }
      };
    });
  });
}

let lastHref: string;
lastHref = getLocationHref();
function historyReplace(): void {
  if (!supportsHistory()) {
    return;
  }
  // onpopstate
  // pushState
  // replaceState
  const oldOnpopstate = _global.onpopstate;
  _global.onpopstate = function (this: WindowEventHandlers, ...args: any[]): any {
    const from = lastHref;
    const to = getLocationHref();
    lastHref = to;
    triggerHandlers(EventTypes.HISTORY, { from, to });
    oldOnpopstate && oldOnpopstate.apply(this, args);
  };
  function historyReplaceFn(originalHistoryFn: voidFun): voidFun {
    return function (this: History, ...args: any[]): void {
      const url = args.length > 2 ? args[2] : undefined;
      if (url) {
        const from = lastHref;
        const to = String(url);
        lastHref = to;
        triggerHandlers(EventTypes.HISTORY, { from, to });
      }
      return originalHistoryFn.apply(this, args);
    };
  }
  replaceOld(_global.history, 'pushState', historyReplaceFn);
  replaceOld(_global.history, 'replaceState', historyReplaceFn);
}

function unhandledrejectionReplace(): void {
  on(_global, EventTypes.UNHANDLEDREJECTION, function (ev: PromiseRejectionEvent) {
    // ev.preventDefault() 阻止默认行为后，控制台就不会再报红色错误
    triggerHandlers(EventTypes.UNHANDLEDREJECTION, ev);
  });
}

function domReplace(): void {
  if (!('document' in _global)) {
    return;
  }
  const clickThrottle = throttle(triggerHandlers, options.throttleDelayTime);
  on(
    _global.document,
    'click',
    function (ev: MouseEvent) {
      clickThrottle(EventTypes.DOM, {
        category: 'click',
        data: this,
      });
    },
    true,
  );
}
