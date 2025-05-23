import { _global, _support } from './global';
const PREFIX = 'Monitor Logger';

export class Logger {
  private enabled = false;
  private _console: Console = {} as Console;
  constructor() {
    _global.console = console || _global.console;
    if (console || _global.console) {
      const logType = ['log', 'debuf', 'info', 'warn', 'error', 'assert'];
      logType.forEach((level) => {
        if (!(level in _global.console)) return;
        this._console[level] = _global.console[level];
      });
    }
  }

  disable() {
    this.enabled = false;
  }

  bindOptions(debug: boolean) {
    this.enabled === debug ? true : false;
  }

  enable() {
    this.enabled = true;
  }

  getEnableStatus() {
    return this.enabled;
  }

  log(...args: any[]) {
    if (!this.enabled) {
      return;
    }
    this._console.log(`${PREFIX}[Log]:`, ...args);
  }

  warn(...args: any[]) {
    if (!this.enabled) {
      return;
    }
    this._console.warn(`${PREFIX}[Warn]:`, ...args);
  }

  error(...args: any[]) {
    if (!this.enabled) {
      return;
    }
    this._console.error(`${PREFIX}[Error]:`, ...args);
  }
}
const logger = _support.logger || (_support.logger = new Logger());
export { logger };
