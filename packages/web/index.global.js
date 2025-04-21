"use strict";
var frogMonitor = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    SDK_NAME: () => SDK_NAME,
    SDK_VERSION: () => SDK_VERSION,
    init: () => init,
    log: () => log
  });

  // ../shared/src/constant.ts
  var globalVar = {
    isLogAddBreadcrumb: true,
    crossOriginThreshold: 1e3
  };
  var ERROR_TYPE_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;

  // ../shared/package.json
  var version = "1.0.0";

  // ../shared/src/config.ts
  var SDK_NAME = "frog-monitor";
  var SDK_VERSION = version;

  // ../utils/src/is.ts
  var nativeToString = Object.prototype.toString;
  function isType(type) {
    return function(value) {
      return nativeToString.call(value) === `[object ${type}]`;
    };
  }
  var variableTypeDetection = {
    isNumber: isType("Number"),
    isString: isType("String"),
    isBoolean: isType("Boolean"),
    isNull: isType("Null"),
    isUndefined: isType("Undefined"),
    isSymbol: isType("Symbol"),
    isFunction: isType("Function"),
    isObject: isType("Object"),
    isArray: isType("Array"),
    isProcess: isType("process"),
    isWindow: isType("Window")
  };
  function isError(wat) {
    switch (nativeToString.call(wat)) {
      case "[object Error]":
        return true;
      case "[object Expection]":
        return true;
      case "[object DOMException]":
        return true;
      default:
        return isInstanceof(wat, Error);
    }
  }
  function isEmpty(wat) {
    return variableTypeDetection.isString(wat) && wat.trim() === "" || wat === void 0 || wat === null;
  }
  function isInstanceof(wat, base) {
    try {
      return wat instanceof base;
    } catch (error) {
      return false;
    }
  }
  function isExistProperty(obj, key) {
    return obj.hasOwnProperty(key);
  }

  // ../utils/src/global.ts
  var isNodeEnv = variableTypeDetection.isProcess(
    typeof process !== "undefined" ? process : 0
  );
  var isWxMiniEnv = variableTypeDetection.isObject(typeof wx !== "undefined" ? wx : 0) && variableTypeDetection.isFunction(typeof App !== "undefined" ? App : 0);
  var isBrowserEnv = variableTypeDetection.isWindow(
    typeof window !== "undefined" ? window : 0
  );
  function getGlobal() {
    if (isBrowserEnv)
      return window;
    if (isWxMiniEnv)
      return wx;
    if (isNodeEnv)
      return process;
  }
  var _global = getGlobal();
  var _support = getGlobalMonitorSupport();
  _support.replaceFlag = _support.replaceFlag || {};
  var replaceFlag = _support.replaceFlag;
  function setFlag(replaceType, isSet) {
    if (replaceFlag[replaceType])
      return;
    replaceFlag[replaceType] = isSet;
  }
  function getFlag(replaceType) {
    return replaceFlag[replaceType] ? true : false;
  }
  function getGlobalMonitorSupport() {
    _global.__Monitor__ = _global.__Monitor__ || {};
    return _global.__Monitor__;
  }
  function supportsHistory() {
    const chrome = _global.chrome;
    const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
    const hasHistoryApi = "history" in _global && !!_global.history.pushState && !!_global.history.replaceState;
    return !isChromePackagedApp && hasHistoryApi;
  }

  // ../utils/src/logger.ts
  var PREFIX = "Monitor Logger";
  var Logger = class {
    constructor() {
      this.enabled = false;
      this._console = {};
      _global.console = console || _global.console;
      if (console || _global.console) {
        const logType = ["log", "debuf", "info", "warn", "error", "assert"];
        logType.forEach((level) => {
          if (!(level in _global.console))
            return;
          this._console[level] = _global.console[level];
        });
      }
    }
    disable() {
      this.enabled = false;
    }
    bindOptions(debug) {
      this.enabled === debug ? true : false;
    }
    enable() {
      this.enabled = true;
    }
    getEnableStatus() {
      return this.enabled;
    }
    log(...args) {
      if (!this.enabled) {
        return;
      }
      this._console.log(`${PREFIX}[Log]:`, ...args);
    }
    warn(...args) {
      if (!this.enabled) {
        return;
      }
      this._console.warn(`${PREFIX}[Warn]:`, ...args);
    }
    error(...args) {
      if (!this.enabled) {
        return;
      }
      this._console.error(`${PREFIX}[Error]:`, ...args);
    }
  };
  var logger = _support.logger || (_support.logger = new Logger());

  // ../utils/src/helpers.ts
  function on(target, eventName, handler, options2 = false) {
    target.addEventListener(eventName, handler, options2);
  }
  function replaceOld(source, name, replacement, isForced = false) {
    if (source === void 0)
      return;
    if (name in source || isForced) {
      const original = source[name];
      const wrapped = replacement(original);
      if (typeof wrapped === "function") {
        source[name] = wrapped;
      }
    }
  }
  function getTimestamp() {
    return Date.now();
  }
  function typeofAny(target, type) {
    return typeof target === type;
  }
  function toStringAny(target, type) {
    return nativeToString.call(target) === type;
  }
  function validateOption(target, targetName, expectType) {
    if (typeofAny(target, expectType))
      return true;
    typeof target !== "undefined" && logger.error(`${targetName}\u671F\u671B\u4F20\u5165${expectType}\u7C7B\u578B\uFF0C\u76EE\u524D\u662F${typeof target}\u7C7B\u578B`);
    return false;
  }
  function toStringValidateOption(target, targetName, expectType) {
    if (toStringAny(target, expectType))
      return true;
    typeof target !== "undefined" && logger.error(
      `${targetName}\u671F\u671B\u4F20\u5165${expectType}\u7C7B\u578B\uFF0C\u76EE\u524D\u662F${nativeToString.call(target)}\u7C7B\u578B`
    );
    return false;
  }
  function getLocationHref() {
    if (typeof document === "undefined" || document.location == null)
      return "";
    return document.location.href;
  }
  var defaultFunctionName = "<anonymous>";
  function getFunctionName(fn) {
    if (!fn || typeof fn !== "function") {
      return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
  }
  function interceptStr(str, interceptLength) {
    if (variableTypeDetection.isString(str)) {
      return str.slice(0, interceptLength) + (str.length > interceptLength ? `:\u622A\u53D6\u524D${interceptLength}\u4E2A\u5B57\u7B26` : "");
    }
  }
  function generateUUID() {
    let d = (/* @__PURE__ */ new Date()).getTime();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == "x" ? r : r & 3 | 8).toString(16);
    });
    return uuid;
  }
  function unknownToString(target) {
    if (variableTypeDetection.isString(target)) {
      return target;
    }
    if (variableTypeDetection.isUndefined(target)) {
      return "undefined";
    }
    return JSON.stringify(target);
  }
  function getCurrentRoute() {
    if (!variableTypeDetection.isFunction(getCurrentPages)) {
      return "";
    }
    const pages = getCurrentPages();
    if (!pages.length) {
      return "App";
    }
    const currentPage = pages.pop();
    return setUrlQuery(currentPage.route, currentPage.options);
  }
  function setUrlQuery(url, query) {
    const queryArr = [];
    Object.keys(query).forEach((k) => {
      queryArr.push(`${k}=${query[k]}`);
    });
    if (url.indexOf("?") !== -1) {
      url = `${url}&${queryArr.join("&")}`;
    } else {
      url = `${url}?${queryArr.join("&")}`;
    }
    return url;
  }
  function throttle(fn, delay) {
    let canRun = true;
    return function(...args) {
      if (!canRun)
        return;
      fn.apply(this, args);
      canRun = false;
      setTimeout(() => {
        canRun = true;
      }, delay);
    };
  }

  // ../utils/src/Severity.ts
  var Severity = /* @__PURE__ */ ((Severity3) => {
    Severity3["Else"] = "else";
    Severity3["Error"] = "error";
    Severity3["Warning"] = "warning";
    Severity3["Info"] = "info";
    Severity3["Debug"] = "debug";
    Severity3["Low"] = "low";
    Severity3["Normal"] = "normal";
    Severity3["High"] = "high";
    Severity3["Critical"] = "critical";
    return Severity3;
  })(Severity || {});
  ((Severity3) => {
    function fromString(level) {
      switch (level) {
        case "debug":
          return "debug" /* Debug */;
        case "info":
        case "log":
        case "assert":
          return "info" /* Info */;
        case "warn":
        case "warning":
          return "warning" /* Warning */;
        case "low" /* Low */:
        case "normal" /* Normal */:
        case "high" /* High */:
        case "critical" /* Critical */:
        case "error":
          return "error" /* Error */;
        default:
          return "else" /* Else */;
      }
    }
    Severity3.fromString = fromString;
  })(Severity || (Severity = {}));

  // ../utils/src/exception.ts
  function nativeTryCatch(fn, errorFn) {
    try {
      fn();
    } catch (error) {
      console.log("error", error);
      if (errorFn) {
        errorFn(error);
      }
    }
  }

  // ../utils/src/httpStatus.ts
  function fromHttpStatus(httpStatus) {
    if (httpStatus < 400) {
      return "ok" /* Ok */;
    }
    if (httpStatus >= 400 && httpStatus < 500) {
      switch (httpStatus) {
        case 401:
          return "unauthenticated" /* Unauthenticated */;
        case 403:
          return "permission_denied" /* PermissionDenied */;
        case 404:
          return "not_found" /* NotFound */;
        case 409:
          return "already_exists" /* AlreadyExists */;
        case 413:
          return "failed_precondition" /* FailedPrecondition */;
        case 429:
          return "resource_exhausted" /* ResourceExhausted */;
        default:
          return "invalid_argument" /* InvalidArgument */;
      }
    }
    if (httpStatus >= 500 && httpStatus < 600) {
      switch (httpStatus) {
        case 501:
          return "unimplemented" /* Unimplemented */;
        case 503:
          return "unavailable" /* Unavailable */;
        case 504:
          return "deadline_exceeded" /* DeadlineExceeded */;
        default:
          return "internal_error" /* InternalError */;
      }
    }
    return "unknown_error" /* UnknownError */;
  }

  // ../utils/src/queue.ts
  var Queue = class {
    constructor() {
      this.stack = [];
      this.isFlushing = false;
      if (!("Promise" in _global))
        return;
      this.micro = Promise.resolve();
    }
    addFn(fn) {
      if (typeof fn !== "function")
        return;
      if (!("Promise" in _global)) {
        fn();
        return;
      }
      this.stack.push(fn);
      if (!this.isFlushing) {
        this.isFlushing = true;
        this.micro.then(() => this.flushStack());
      }
    }
    clear() {
      this.stack = [];
    }
    getStack() {
      return this.stack;
    }
    flushStack() {
      const temp = this.stack.slice(0);
      this.stack.length = 0;
      this.isFlushing = false;
      for (let i = 0; i < temp.length; i++) {
        temp[i]();
      }
    }
  };

  // ../utils/src/browser.ts
  function htmlElementAsString(target) {
    const tagName = target.tagName.toLowerCase();
    if (tagName === "body") {
      return null;
    }
    let classNames = target.classList.value;
    classNames = classNames !== "" ? ` class="${classNames}"` : "";
    const id = target.id ? ` id="${target.id}"` : "";
    const innerText = target.innerText;
    return `<${tagName}${id}${classNames !== "" ? classNames : ""}>${innerText}</${tagName}>`;
  }
  function parseUrlToObj(url) {
    if (!url) {
      return {};
    }
    const match = url.match(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);
    if (!match) {
      return {};
    }
    const query = match[6] || "";
    const fragment = match[8] || "";
    return {
      host: match[4],
      path: match[5],
      protocol: match[2],
      relative: match[5] + query + fragment
      // everything minus origin
    };
  }
  function setSilentFlag(paramOptions = {}) {
    setFlag("xhr" /* XHR */, !!paramOptions.silentXhr);
    setFlag("fetch" /* FETCH */, !!paramOptions.silentFetch);
    setFlag("console" /* CONSOLE */, !!paramOptions.silentConsole);
    setFlag("dom" /* DOM */, !!paramOptions.silentDom);
    setFlag("history" /* HISTORY */, !!paramOptions.silentHistory);
    setFlag("error" /* ERROR */, !!paramOptions.silentError);
    setFlag("hashchange" /* HASHCHANGE */, !!paramOptions.silentHashchange);
    setFlag("unhandledrejection" /* UNHANDLEDREJECTION */, !!paramOptions.silentUnhandledrejection);
    setFlag("Vue" /* VUE */, !!paramOptions.silentVue);
    setFlag("AppOnError" /* AppOnError */, !!paramOptions.silentWxOnError);
    setFlag("AppOnUnhandledRejection" /* AppOnUnhandledRejection */, !!paramOptions.silentUnhandledrejection);
    setFlag("AppOnPageNotFound" /* AppOnPageNotFound */, !!paramOptions.silentWxOnPageNotFound);
    setFlag("PageOnShareAppMessage" /* PageOnShareAppMessage */, !!paramOptions.silentWxOnShareAppMessage);
    setFlag("miniRoute" /* MINI_ROUTE */, !!paramOptions.silentMiniRoute);
  }
  function extractErrorStack(ex, level) {
    const normal = {
      time: getTimestamp(),
      url: getLocationHref(),
      name: ex.name,
      level,
      message: ex.message
    };
    if (typeof ex.stack === "undefined" || !ex.stack) {
      return normal;
    }
    const chrome = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i, winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i, geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i, chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/, lines = ex.stack.split("\n"), stack = [];
    let submatch, parts, element;
    for (let i = 0, j = lines.length; i < j; ++i) {
      if (parts = chrome.exec(lines[i])) {
        const isNative = parts[2] && parts[2].indexOf("native") === 0;
        const isEval = parts[2] && parts[2].indexOf("eval") === 0;
        if (isEval && (submatch = chromeEval.exec(parts[2]))) {
          parts[2] = submatch[1];
          parts[3] = submatch[2];
          parts[4] = submatch[3];
        }
        element = {
          url: !isNative ? parts[2] : null,
          func: parts[1] || "UNKNOWN_FUNCTION" /* UNKNOWN_FUNCTION */,
          args: isNative ? [parts[2]] : [],
          line: parts[3] ? +parts[3] : null,
          column: parts[4] ? +parts[4] : null
        };
      } else if (parts = winjs.exec(lines[i])) {
        element = {
          url: parts[2],
          func: parts[1] || "UNKNOWN_FUNCTION" /* UNKNOWN_FUNCTION */,
          args: [],
          line: +parts[3],
          column: parts[4] ? +parts[4] : null
        };
      } else if (parts = gecko.exec(lines[i])) {
        const isEval = parts[3] && parts[3].indexOf(" > eval") > -1;
        if (isEval && (submatch = geckoEval.exec(parts[3]))) {
          parts[3] = submatch[1];
          parts[4] = submatch[2];
          parts[5] = null;
        } else if (i === 0 && !parts[5] && typeof ex.columnNumber !== "undefined") {
          stack[0].column = ex.columnNumber + 1;
        }
        element = {
          url: parts[3],
          func: parts[1] || "UNKNOWN_FUNCTION" /* UNKNOWN_FUNCTION */,
          args: parts[2] ? parts[2].split(",") : [],
          line: parts[4] ? +parts[4] : null,
          column: parts[5] ? +parts[5] : null
        };
      } else {
        continue;
      }
      if (!element.func && element.line) {
        element.func = "UNKNOWN_FUNCTION" /* UNKNOWN_FUNCTION */;
      }
      stack.push(element);
    }
    if (!stack.length) {
      return null;
    }
    return {
      ...normal,
      stack
    };
  }

  // ../core/src/breadcrumb.ts
  var Breadcrumb = class {
    constructor() {
      this.maxBreadcrumbs = 10;
      this.beforePushBreadcrumb = null;
      this.stack = [];
    }
    push(data) {
      if (typeof this.beforePushBreadcrumb === "function") {
        let result = null;
        const beforePushBreadcrumb = this.beforePushBreadcrumb;
        result = beforePushBreadcrumb(this, data);
        if (!result) {
          return;
        }
        this.immediatePush(result);
        return;
      }
      this.immediatePush(data);
    }
    immediatePush(data) {
      data.time || (data.time = getTimestamp());
      if (this.stack.length >= this.maxBreadcrumbs) {
        this.shift();
      }
      this.stack.push(data);
      this.stack.sort((a, b) => a.time - b.time);
      logger.log(this.stack);
    }
    shift() {
      return this.stack.shift() !== void 0;
    }
    clear() {
      this.stack = [];
    }
    getStack() {
      return this.stack;
    }
    getCategory(type) {
      switch (type) {
        case "Xhr" /* XHR */:
        case "Fetch" /* FETCH */:
          return "http" /* HTTP */;
        case "Click" /* CLICK */:
        case "Route" /* ROUTE */:
        case "Tap" /* TAP */:
        case "Touchmove" /* TOUCHMOVE */:
          return "user" /* USER */;
        case "Console" /* CONSOLE */:
        case "Customer" /* CUSTOMER */:
          return "debug" /* DEBUG */;
        case "App On Launch" /* APP_ON_LAUNCH */:
        case "App On Show" /* APP_ON_SHOW */:
        case "App On Hide" /* APP_ON_HIDE */:
        case "Page On Show" /* PAGE_ON_SHOW */:
        case "Page On Hide" /* PAGE_ON_HIDE */:
        case "Page On Share App Message" /* PAGE_ON_SHARE_APP_MESSAGE */:
        case "Page On Share Timeline" /* PAGE_ON_SHARE_TIMELINE */:
        case "Page On Tab Item Tap" /* PAGE_ON_TAB_ITEM_TAP */:
          return "lifecycle" /* LIFECYCLE */;
        case "Unhandledrejection" /* UNHANDLEDREJECTION */:
        case "Code Error" /* CODE_ERROR */:
        case "Resource" /* RESOURCE */:
        case "Vue" /* VUE */:
        case "React" /* REACT */:
        default:
          return "exception" /* EXCEPTION */;
      }
    }
    bindOptions(options2) {
      const { maxBreadcrumbs, beforePushBreadcrumb } = options2;
      validateOption(maxBreadcrumbs, "maxBreadcrumbs", "number") && (this.maxBreadcrumbs = maxBreadcrumbs);
      validateOption(beforePushBreadcrumb, "beforePushBreadcrumb", "function") && (this.beforePushBreadcrumb = beforePushBreadcrumb);
    }
  };
  var breadcrumb = _support.breadcrumb || (_support.breadcrumb = new Breadcrumb());

  // ../types/src/transportData.ts
  function isReportDataType(data) {
    return data.actionType === void 0 && !data.isTrackData;
  }

  // ../core/src/transportData.ts
  var TransportData = class {
    constructor() {
      this.beforeDataReport = null;
      this.backTrackerId = null;
      this.configReportXhr = null;
      this.configReportUrl = null;
      this.configReportWxRequest = null;
      this.useImgUpload = false;
      this.apikey = "";
      this.trackKey = "";
      this.errorDsn = "";
      this.trackDsn = "";
      this.queue = new Queue();
    }
    imgRequest(data, url) {
      const requestFun = () => {
        let img = new Image();
        const spliceStr = url.indexOf("?") === -1 ? "?" : "&";
        img.src = `${url}${spliceStr}data=${encodeURIComponent(JSON.stringify(data))}`;
        img = null;
      };
      this.queue.addFn(requestFun);
    }
    getRecord() {
      const recordData = _support.record;
      if (recordData && variableTypeDetection.isArray(recordData) && recordData.length > 2) {
        return recordData;
      }
      return [];
    }
    getDeviceInfo() {
      return _support.deviceInfo || {};
    }
    async beforePost(data) {
      if (isReportDataType(data)) {
        const errorId = createErrorId(data, this.apikey);
        if (!errorId)
          return false;
        data.errorId = errorId;
      }
      let transportData2 = this.getTransportData(data);
      if (typeof this.beforeDataReport === "function") {
        transportData2 = await this.beforeDataReport(transportData2);
        if (!transportData2)
          return false;
      }
      return transportData2;
    }
    async xhrPost(data, url) {
      const requestFun = () => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST" /* Post */, url);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.withCredentials = true;
        if (typeof this.configReportXhr === "function") {
          this.configReportXhr(xhr, data);
        }
        xhr.send(JSON.stringify(data));
      };
      this.queue.addFn(requestFun);
    }
    async wxPost(data, url) {
      const requestFun = () => {
        let requestOptions = { method: "POST" };
        if (typeof this.configReportWxRequest === "function") {
          const params = this.configReportWxRequest(data);
          requestOptions = { ...requestOptions, ...params };
        }
        requestOptions = {
          ...requestOptions,
          data: JSON.stringify(data),
          url
        };
        wx.request(requestOptions);
      };
      this.queue.addFn(requestFun);
    }
    getAuthInfo() {
      const trackerId = this.getTrackerId();
      const result = {
        trackerId: String(trackerId),
        sdkVersion: SDK_VERSION,
        sdkName: SDK_NAME
      };
      this.apikey && (result.apikey = this.apikey);
      this.trackKey && (result.trackKey = this.trackKey);
      return result;
    }
    getApikey() {
      return this.apikey;
    }
    getTrackKey() {
      return this.trackKey;
    }
    getTrackerId() {
      if (typeof this.backTrackerId === "function") {
        const trackerId = this.backTrackerId();
        if (typeof trackerId === "string" || typeof trackerId === "number") {
          return trackerId;
        } else {
          logger.error(
            `trackerId:${trackerId} \u671F\u671B string \u6216 number \u7C7B\u578B\uFF0C\u4F46\u662F\u4F20\u5165\u7C7B\u578B\u4E3A ${typeof trackerId}`
          );
        }
      }
      return "";
    }
    getTransportData(data) {
      return {
        authInfo: this.getAuthInfo(),
        breadcrumb: breadcrumb.getStack(),
        data,
        record: this.getRecord(),
        deviceInfo: this.getDeviceInfo()
      };
    }
    isSdkTransportUrl(targetUrl) {
      let isSdkDsn = false;
      if (this.errorDsn && targetUrl.indexOf(this.errorDsn) !== -1) {
        isSdkDsn = true;
      }
      if (this.trackDsn && targetUrl.indexOf(this.trackDsn) !== -1) {
        isSdkDsn = true;
      }
      return isSdkDsn;
    }
    bindOptions(options2 = {}) {
      const {
        dsn,
        beforeDataReport,
        apikey,
        configReportXhr,
        backTrackerId,
        trackDsn,
        trackKey,
        configReportUrl,
        useImgUpload,
        configReportWxRequest
      } = options2;
      validateOption(apikey, "apikey", "string") && (this.apikey = apikey);
      validateOption(trackKey, "trackKey", "string") && (this.trackKey = trackKey);
      validateOption(dsn, "dsn", "string") && (this.errorDsn = dsn);
      validateOption(trackDsn, "trackDsn", "string") && (this.trackDsn = trackDsn);
      validateOption(useImgUpload, "useImgUpload", "boolean") && (this.useImgUpload = useImgUpload);
      validateOption(beforeDataReport, "beforeDataReport", "function") && (this.beforeDataReport = beforeDataReport);
      validateOption(configReportXhr, "configReportXhr", "function") && (this.configReportXhr = configReportXhr);
      validateOption(backTrackerId, "backTrackerId", "function") && (this.backTrackerId = backTrackerId);
      validateOption(configReportUrl, "configReportUrl", "function") && (this.configReportUrl = configReportUrl);
      validateOption(configReportWxRequest, "configReportWxRequest", "function") && (this.configReportWxRequest = configReportWxRequest);
    }
    /**
     * 监控错误上报的请求函数
     * @param data 错误上报数据格式
     * @returns
     */
    async send(data) {
      let dsn = "";
      if (isReportDataType(data)) {
        dsn = this.errorDsn;
        if (isEmpty(dsn)) {
          logger.error("dsn\u4E3A\u7A7A\uFF0C\u6CA1\u6709\u4F20\u5165\u76D1\u63A7\u9519\u8BEF\u4E0A\u62A5\u7684dsn\u5730\u5740\uFF0C\u8BF7\u5728init\u4E2D\u4F20\u5165");
          return;
        }
      } else {
        dsn = this.trackDsn;
        if (isEmpty(dsn)) {
          logger.error("trackDsn\u4E3A\u7A7A\uFF0C\u6CA1\u6709\u4F20\u5165\u76D1\u63A7\u9519\u8BEF\u4E0A\u62A5\u7684dsn\u5730\u5740\uFF0C\u8BF7\u5728init\u4E2D\u4F20\u5165");
          return;
        }
      }
      const result = await this.beforePost(data);
      if (!result)
        return;
      if (typeof this.configReportUrl === "function") {
        dsn = this.configReportUrl(result, dsn);
        if (!dsn)
          return;
      }
      if (isBrowserEnv) {
        return this.useImgUpload ? this.imgRequest(result, dsn) : this.xhrPost(result, dsn);
      }
      if (isWxMiniEnv) {
        return this.wxPost(result, dsn);
      }
    }
  };
  var transportData = _support.transportData || (_support.transportData = new TransportData());

  // ../core/src/options.ts
  var Options = class {
    constructor() {
      this.beforeAppAjaxSend = () => {
      };
      this.traceIdFieldName = "Trace-Id";
      this.throttleDelayTime = 0;
      this.maxDuplicateCount = 2;
      // wx-mini
      this.appOnLaunch = () => {
      };
      this.appOnShow = () => {
      };
      this.onPageNotFound = () => {
      };
      this.appOnHide = () => {
      };
      this.pageOnUnload = () => {
      };
      this.pageOnShow = () => {
      };
      this.pageOnHide = () => {
      };
      this.onShareAppMessage = () => {
      };
      this.onShareTimeline = () => {
      };
      this.onTabItemTap = () => {
      };
      this.triggerWxEvent = () => {
      };
      this.enableTraceId = false;
    }
    bindOptions(options2 = {}) {
      const {
        beforeAppAjaxSend,
        enableTraceId,
        filterXhrUrlRegExp,
        traceIdFieldName,
        throttleDelayTime,
        includeHttpUrlTraceIdRegExp,
        appOnLaunch,
        appOnShow,
        appOnHide,
        pageOnUnload,
        pageOnShow,
        pageOnHide,
        onPageNotFound,
        onShareAppMessage,
        onShareTimeline,
        onTabItemTap,
        wxNavigateToMiniProgram,
        triggerWxEvent,
        maxDuplicateCount,
        onRouteChange
      } = options2;
      validateOption(beforeAppAjaxSend, "beforeAppAjaxSend", "function") && (this.beforeAppAjaxSend = beforeAppAjaxSend);
      validateOption(appOnLaunch, "appOnLaunch", "function") && (this.appOnLaunch = appOnLaunch);
      validateOption(appOnShow, "appOnShow", "function") && (this.appOnShow = appOnShow);
      validateOption(appOnHide, "appOnHide", "function") && (this.appOnHide = appOnHide);
      validateOption(pageOnUnload, "pageOnUnload", "function") && (this.pageOnUnload = pageOnUnload);
      validateOption(pageOnShow, "pageOnShow", "function") && (this.pageOnShow = pageOnShow);
      validateOption(pageOnHide, "pageOnHide", "function") && (this.pageOnHide = pageOnHide);
      validateOption(onPageNotFound, "onPageNotFound", "function") && (this.onPageNotFound = onPageNotFound);
      validateOption(onShareAppMessage, "onShareAppMessage", "function") && (this.onShareAppMessage = onShareAppMessage);
      validateOption(onShareTimeline, "onShareTimeline", "function") && (this.onShareTimeline = onShareTimeline);
      validateOption(onTabItemTap, "onTabItemTap", "function") && (this.onTabItemTap = onTabItemTap);
      validateOption(wxNavigateToMiniProgram, "wxNavigateToMiniProgram", "function") && (this.wxNavigateToMiniProgram = wxNavigateToMiniProgram);
      validateOption(triggerWxEvent, "triggerWxEvent", "function") && (this.triggerWxEvent = triggerWxEvent);
      validateOption(onRouteChange, "onRouteChange", "function") && (this.onRouteChange = onRouteChange);
      validateOption(enableTraceId, "enableTraceId", "boolean") && (this.enableTraceId = enableTraceId);
      validateOption(traceIdFieldName, "traceIdFieldName", "string") && (this.traceIdFieldName = traceIdFieldName);
      validateOption(throttleDelayTime, "throttleDelayTime", "number") && (this.throttleDelayTime = throttleDelayTime);
      validateOption(maxDuplicateCount, "maxDuplicateCount", "number") && (this.maxDuplicateCount = maxDuplicateCount);
      toStringValidateOption(filterXhrUrlRegExp, "filterXhrUrlRegExp", "[object RegExp]") && (this.filterXhrUrlRegExp = filterXhrUrlRegExp);
      toStringValidateOption(
        includeHttpUrlTraceIdRegExp,
        "includeHttpUrlTraceIdRegExp",
        "[object RegExp]"
      ) && (this.includeHttpUrlTraceIdRegExp = includeHttpUrlTraceIdRegExp);
    }
  };
  var options = _support.options || (_support.options = new Options());
  function setTraceId(httpUrl, callback) {
    const { includeHttpUrlTraceIdRegExp, enableTraceId } = options;
    if (enableTraceId && includeHttpUrlTraceIdRegExp && includeHttpUrlTraceIdRegExp.test(httpUrl)) {
      const traceId = generateUUID();
      callback(options.traceIdFieldName, traceId);
    }
  }
  function initOptions(paramOptions = {}) {
    setSilentFlag(paramOptions);
    breadcrumb.bindOptions(paramOptions);
    logger.bindOptions(paramOptions.debug);
    transportData.bindOptions(paramOptions);
    options.bindOptions(paramOptions);
  }

  // ../core/src/errorId.ts
  var allErrorNumber = {};
  function createErrorId(data, apikey) {
    let id;
    switch (data.type) {
      case "HTTP_ERROR" /* FETCH_ERROR */:
        id = data.type + data.request.method + data.response.status + getRealPath(data.request.url) + apikey;
        break;
      case "JAVASCRIPT_ERROR" /* JAVASCRIPT_ERROR */:
      case "REACT_ERROR" /* REACT_ERROR */:
      case "VUE_ERROR" /* VUE_ERROR */:
        id = data.type + data.name + data.message + apikey;
        break;
      case "LOG_ERROR" /* LOG_ERROR */:
        id = data.customTag + data.type + data.name + apikey;
      case "PROMISE_ERROR" /* PROMISE_ERROR */:
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
    if (typeof allErrorNumber[id] === "number") {
      allErrorNumber[id]++;
    } else {
      allErrorNumber[id] = 1;
    }
    return id;
  }
  function generatePromiseErrorId(data, apikey) {
    const locationUrl = getRealPath(data.url);
    if (data.name === "unhandledrejection" /* UNHANDLEDREJECTION */) {
      return data.type + objectOrder(data.message) + apikey;
    }
    return data.type + data.name + objectOrder(data.message) + locationUrl;
  }
  function objectOrder(reason) {
    const sortFn = (obj) => {
      return Object.keys(obj).sort().reduce((total, key) => {
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
  function getRealPath(url) {
    return url.replace(/[\?#].*$/, "").replace(/\/\d+([\/]*$)/, "{param}$1");
  }
  function hashCode(str) {
    let hash = 0;
    if (str.length === 0)
      return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  }

  // ../core/src/transformData.ts
  function httpTransform(data) {
    let message = "";
    const { elapsedTime, time, method, traceId, type, status } = data;
    const name = `${type}--${method}`;
    if (status === 0) {
      message = elapsedTime <= globalVar.crossOriginThreshold ? "http\u8BF7\u6C42\u5931\u8D25\uFF0C\u5931\u8D25\u539F\u56E0\uFF1A\u8DE8\u57DF\u9650\u5236\u6216\u57DF\u540D\u4E0D\u5B58\u5728" : "http\u8BF7\u6C42\u5931\u8D25\uFF0C\u5931\u8D25\u539F\u56E0\uFF1A\u8D85\u65F6";
    } else {
      message = fromHttpStatus(status);
    }
    message = message === "ok" /* Ok */ ? message : `${message} ${getRealPath(data.url)}`;
    return {
      type: "HTTP_ERROR" /* FETCH_ERROR */,
      url: getLocationHref(),
      time,
      elapsedTime,
      level: "low" /* Low */,
      message,
      name,
      request: {
        httpType: type,
        method,
        url: data.url,
        traceId,
        data: data.reqData || ""
      },
      response: {
        status,
        data: data.responseText
      }
    };
  }
  var resourceMap = {
    img: "\u56FE\u7247",
    script: "js\u811A\u672C"
  };
  function resourceTransform(target) {
    return {
      type: "RESOURCE_ERROR" /* RESOURCE_ERROR */,
      url: getLocationHref(),
      message: "\u8D44\u6E90\u5730\u5740: " + (interceptStr(target.src, 120) || interceptStr(target.href, 120)),
      level: "low" /* Low */,
      time: getTimestamp(),
      name: `${resourceMap[target.localName] || target.localName}\u52A0\u8F7D\u5931\u8D25`
    };
  }
  function handleConsole(data) {
    if (globalVar.isLogAddBreadcrumb) {
      breadcrumb.push({
        type: "Console" /* CONSOLE */,
        data,
        level: Severity.fromString(data.level),
        category: breadcrumb.getCategory("Console" /* CONSOLE */)
      });
    }
  }

  // ../core/src/external.ts
  function log({
    message = "emptyMsg",
    tag = "",
    level = "critical" /* Critical */,
    ex = "",
    type = "LOG_ERROR" /* LOG_ERROR */
  }) {
    let errorInfo = {};
    if (isError(ex)) {
      errorInfo = extractErrorStack(ex, level);
    }
    const error = {
      type,
      level,
      message: unknownToString(message),
      name: "Monitor.log",
      customTag: unknownToString(tag),
      time: getTimestamp(),
      url: isWxMiniEnv ? getCurrentRoute() : getLocationHref(),
      ...errorInfo
    };
    breadcrumb.push({
      type: "Customer" /* CUSTOMER */,
      category: breadcrumb.getCategory("Customer" /* CUSTOMER */),
      data: message,
      level: Severity.fromString(level.toString())
    });
    transportData.send(error);
  }

  // ../core/src/subscribe.ts
  var handlers = {};
  function subscribeEvent(handler) {
    if (!handler || getFlag(handler.type))
      return false;
    setFlag(handler.type, true);
    handlers[handler.type] = handlers[handler.type] || [];
    handlers[handler.type].push(handler.callback);
    return true;
  }
  function triggerHandlers(type, data) {
    if (!type || !handlers[type])
      return;
    handlers[type].forEach((callback) => {
      nativeTryCatch(
        () => {
          callback(data);
        },
        (e) => {
          logger.error(
            `\u91CD\u5199\u4E8B\u4EF6triggerHandlers\u7684\u56DE\u8C03\u51FD\u6570\u53D1\u751F\u9519\u8BEF
Type:${type}
Name: ${getFunctionName(
              callback
            )}
Error: ${e}`
          );
        }
      );
    });
  }

  // ../browser/src/replace.ts
  function isFilterHttpUrl(url) {
    return options.filterXhrUrlRegExp && options.filterXhrUrlRegExp.test(url);
  }
  function replace(type) {
    switch (type) {
      case "xhr" /* XHR */:
        xhrReplace();
        break;
      case "fetch" /* FETCH */:
        fetchReplace();
        break;
      case "error" /* ERROR */:
        listenError();
        break;
      case "console" /* CONSOLE */:
        consoleReplace();
        break;
      case "history" /* HISTORY */:
        historyReplace();
        break;
      case "unhandledrejection" /* UNHANDLEDREJECTION */:
        unhandledrejectionReplace();
        break;
      case "dom" /* DOM */:
        domReplace();
        break;
      case "hashchange" /* HASHCHANGE */:
        listenHashChange();
        break;
      default:
        break;
    }
  }
  function addReplaceHandler(handler) {
    if (!subscribeEvent(handler))
      return;
    replace(handler.type);
  }
  function xhrReplace() {
    if (!("XMLHttpRequest" in _global)) {
      return;
    }
    const originalXhrProto = XMLHttpRequest.prototype;
    replaceOld(originalXhrProto, "open", (originalOpen) => {
      return function(...args) {
        this.monitor_xhr = {
          method: args[0],
          url: args[1],
          sTime: getTimestamp(),
          type: "xhr" /* XHR */
        };
        originalOpen.apply(this, args);
      };
    });
    replaceOld(originalXhrProto, "send", (originalSend) => {
      return function(...args) {
        const { method, url } = this.monitor_xhr;
        setTraceId(url, (headerFieldName, traceId) => {
          this.monitor_xhr.traceId = traceId;
          this.setRequestHeader(headerFieldName, traceId);
        });
        options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method, url }, this);
        on(this, "loadend", function() {
          if (method === "POST" /* Post */ && transportData.isSdkTransportUrl(url) || isFilterHttpUrl(url))
            return;
          const { responseType, response, status } = this;
          this.monitor_xhr.reqData = args[0];
          const eTime = getTimestamp();
          this.monitor_xhr.time = this.monitor_xhr.sTime;
          this.monitor_xhr.status = status;
          if (["", "json", "text"].indexOf(responseType) !== -1) {
            this.monitor_xhr.responseText = typeof response === "object" ? JSON.stringify(response) : response;
          }
          this.monitor_xhr.elapsedTime = eTime - this.monitor_xhr.sTime;
          triggerHandlers("xhr" /* XHR */, this.monitor_xhr);
        });
        originalSend.apply(this, args);
      };
    });
  }
  function fetchReplace() {
    if (!("fetch" in _global)) {
      return;
    }
    replaceOld(_global, "fetch" /* FETCH */, (originalFetch) => {
      return function(url, config) {
        const sTime = getTimestamp();
        const method = config?.method || "GET";
        let handlerData = {
          method,
          url,
          reqData: config?.body,
          type: "fetch" /* FETCH */
        };
        const headers = new Headers(config.headers || {});
        Object.assign(headers, {
          setRequestHeader: headers.set
        });
        setTraceId(url, (headerFieldName, traceId) => {
          handlerData.traceId = traceId;
          headers.set(headerFieldName, traceId);
        });
        options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method, url }, headers);
        config = {
          ...config,
          headers
        };
        return originalFetch.apply(_global, [url, config]).then(
          (res) => {
            const tempRes = res.clone();
            const eTime = getTimestamp();
            handlerData = {
              ...handlerData,
              elapsedTime: eTime - sTime,
              status: tempRes.status,
              // statusText: tempRes.statusText,
              time: sTime
            };
            tempRes.text().then((data) => {
              if (method === "POST" /* Post */ && transportData.isSdkTransportUrl(url))
                return;
              if (isFilterHttpUrl(url))
                return;
              handlerData.responseText = tempRes.status > 401 /* UNAUTHORIZED */ && data;
              triggerHandlers("fetch" /* FETCH */, handlerData);
            });
            return res;
          },
          (err) => {
            const eTime = getTimestamp();
            if (method === "POST" /* Post */ && transportData.isSdkTransportUrl(url))
              return;
            if (isFilterHttpUrl(url))
              return;
            handlerData = {
              ...handlerData,
              elapsedTime: eTime - sTime,
              status: 0,
              // statusText: err.name + err.message,
              time: sTime
            };
            triggerHandlers("fetch" /* FETCH */, handlerData);
            throw err;
          }
        );
      };
    });
  }
  function listenHashChange() {
    if (!isExistProperty(_global, "onpopstate")) {
      on(_global, "hashchange" /* HASHCHANGE */, function(e) {
        triggerHandlers("hashchange" /* HASHCHANGE */, e);
      });
    }
  }
  function listenError() {
    on(
      _global,
      "error" /* ERROR */,
      function(e) {
        triggerHandlers("error" /* ERROR */, e);
      },
      true
    );
  }
  function consoleReplace() {
    if (!("console" in _global)) {
      return;
    }
    const logType = ["log", "debug", "info", "warn", "error", "assert"];
    logType.forEach(function(level) {
      if (!(level in _global.console)) {
        return;
      }
      replaceOld(_global.console, level, function(originalConsole) {
        return function(...args) {
          if (originalConsole) {
            triggerHandlers("console" /* CONSOLE */, { args, level });
            originalConsole.apply(_global.console, args);
          }
        };
      });
    });
  }
  var lastHref;
  lastHref = getLocationHref();
  function historyReplace() {
    if (!supportsHistory()) {
      return;
    }
    const oldOnpopstate = _global.onpopstate;
    _global.onpopstate = function(...args) {
      const from = lastHref;
      const to = getLocationHref();
      lastHref = to;
      triggerHandlers("history" /* HISTORY */, { from, to });
      oldOnpopstate && oldOnpopstate.apply(this, args);
    };
    function historyReplaceFn(originalHistoryFn) {
      return function(...args) {
        const url = args.length > 2 ? args[2] : void 0;
        if (url) {
          const from = lastHref;
          const to = String(url);
          lastHref = to;
          triggerHandlers("history" /* HISTORY */, { from, to });
        }
        return originalHistoryFn.apply(this, args);
      };
    }
    replaceOld(_global.history, "pushState", historyReplaceFn);
    replaceOld(_global.history, "replaceState", historyReplaceFn);
  }
  function unhandledrejectionReplace() {
    on(_global, "unhandledrejection" /* UNHANDLEDREJECTION */, function(ev) {
      triggerHandlers("unhandledrejection" /* UNHANDLEDREJECTION */, ev);
    });
  }
  function domReplace() {
    if (!("document" in _global)) {
      return;
    }
    const clickThrottle = throttle(triggerHandlers, options.throttleDelayTime);
    on(
      _global.document,
      "click",
      function(ev) {
        clickThrottle("dom" /* DOM */, {
          category: "click",
          data: this
        });
      },
      true
    );
  }

  // ../browser/src/handleEvents.ts
  var HandleEvents = {
    /**
     * 处理xhr、fetch回调
     */
    handleHttp(data, type) {
      const isError2 = data.status === 0 || data.status === 400 /* BAD_REQUEST */ || data.status > 401 /* UNAUTHORIZED */;
      const result = httpTransform(data);
      breadcrumb.push({
        type,
        category: breadcrumb.getCategory(type),
        data: result,
        level: "info" /* Info */,
        time: data.time
      });
      if (isError2) {
        breadcrumb.push({
          type,
          category: breadcrumb.getCategory("Code Error" /* CODE_ERROR */),
          data: result,
          level: "error" /* Error */,
          time: data.time
        });
        transportData.send(result);
      }
    },
    /**
     * 处理window的error的监听回调
     */
    handleError(errorEvent) {
      const target = errorEvent.target;
      if (target.localName) {
        const data = resourceTransform(target);
        breadcrumb.push({
          type: "Resource" /* RESOURCE */,
          category: breadcrumb.getCategory("Resource" /* RESOURCE */),
          data,
          level: "error" /* Error */
        });
        return transportData.send(data);
      }
      const { colno, error, filename, lineno, message } = errorEvent;
      let result;
      if (error && isError(error)) {
        result = extractErrorStack(error, "normal" /* Normal */);
      }
      result || (result = HandleEvents.handleNotErrorInstance(message, filename, lineno, colno));
      result.type = "JAVASCRIPT_ERROR" /* JAVASCRIPT_ERROR */;
      breadcrumb.push({
        type: "Code Error" /* CODE_ERROR */,
        category: breadcrumb.getCategory("Code Error" /* CODE_ERROR */),
        data: result,
        level: "error" /* Error */
      });
      transportData.send(result);
    },
    handleNotErrorInstance(message, filename, lineno, colno) {
      let name = "UNKNOWN" /* UNKNOWN */;
      const url = filename || getLocationHref();
      let msg = message;
      const matches = message.match(ERROR_TYPE_RE);
      if (matches[1]) {
        name = matches[1];
        msg = matches[2];
      }
      const element = {
        url,
        func: "UNKNOWN_FUNCTION" /* UNKNOWN_FUNCTION */,
        args: "UNKNOWN" /* UNKNOWN */,
        line: lineno,
        col: colno
      };
      return {
        url,
        name,
        message: msg,
        level: "normal" /* Normal */,
        time: getTimestamp(),
        stack: [element]
      };
    },
    handleHistory(data) {
      const { from, to } = data;
      const { relative: parsedFrom } = parseUrlToObj(from);
      const { relative: parsedTo } = parseUrlToObj(to);
      breadcrumb.push({
        type: "Route" /* ROUTE */,
        category: breadcrumb.getCategory("Route" /* ROUTE */),
        data: {
          from: parsedFrom ? parsedFrom : "/",
          to: parsedTo ? parsedTo : "/"
        },
        level: "info" /* Info */
      });
      const { onRouteChange } = options;
      if (onRouteChange) {
        onRouteChange(from, to);
      }
    },
    handleHashChange(data) {
      const { oldURL, newURL } = data;
      const { relative: from } = parseUrlToObj(oldURL);
      const { relative: to } = parseUrlToObj(newURL);
      breadcrumb.push({
        type: "Route" /* ROUTE */,
        category: breadcrumb.getCategory("Route" /* ROUTE */),
        data: {
          from,
          to
        },
        level: "info" /* Info */
      });
      const { onRouteChange } = options;
      if (onRouteChange) {
        onRouteChange(from, to);
      }
    },
    handleUnhandleRejection(ev) {
      let data = {
        type: "PROMISE_ERROR" /* PROMISE_ERROR */,
        message: unknownToString(ev.reason),
        url: getLocationHref(),
        name: ev.type,
        time: getTimestamp(),
        level: "low" /* Low */
      };
      if (isError(ev.reason)) {
        data = {
          ...data,
          ...extractErrorStack(ev.reason, "low" /* Low */)
        };
      }
      breadcrumb.push({
        type: "Unhandledrejection" /* UNHANDLEDREJECTION */,
        category: breadcrumb.getCategory("Unhandledrejection" /* UNHANDLEDREJECTION */),
        data: { ...data },
        level: "error" /* Error */
      });
      transportData.send(data);
    }
  };

  // ../browser/src/load.ts
  function setupReplace() {
    addReplaceHandler({
      callback: (data) => {
        HandleEvents.handleHttp(data, "Xhr" /* XHR */);
      },
      type: "xhr" /* XHR */
    });
    addReplaceHandler({
      callback: (data) => {
        HandleEvents.handleHttp(data, "Fetch" /* FETCH */);
      },
      type: "fetch" /* FETCH */
    });
    addReplaceHandler({
      callback: (error) => {
        HandleEvents.handleError(error);
      },
      type: "error" /* ERROR */
    });
    addReplaceHandler({
      callback: (data) => {
        handleConsole(data);
      },
      type: "console" /* CONSOLE */
    });
    addReplaceHandler({
      callback: (data) => {
        HandleEvents.handleHistory(data);
      },
      type: "history" /* HISTORY */
    });
    addReplaceHandler({
      callback: (data) => {
        HandleEvents.handleHashChange(data);
      },
      type: "hashchange" /* HASHCHANGE */
    });
    addReplaceHandler({
      callback: (ev) => {
        HandleEvents.handleUnhandleRejection(ev);
      },
      type: "unhandledrejection" /* UNHANDLEDREJECTION */
    });
    addReplaceHandler({
      callback: (data) => {
        const htmlString = htmlElementAsString(data.data.activeElement);
        if (htmlString) {
          breadcrumb.push({
            type: "Click" /* CLICK */,
            category: breadcrumb.getCategory("Click" /* CLICK */),
            data: htmlString,
            level: "info" /* Info */
          });
        }
      },
      type: "dom" /* DOM */
    });
  }

  // ../browser/src/index.ts
  function webInit(options2 = {}) {
    if (!("XMLHttpRequest" in _global) || options2.disabled)
      return;
    initOptions(options2);
    setupReplace;
  }
  function init(options2 = {}) {
    webInit(options2);
  }
  return __toCommonJS(src_exports);
})();
