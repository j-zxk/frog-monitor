import { initOptions, log } from 'frog-monitor-core';
import { InitOptions } from 'frog-monitor-types';
import { _global } from 'frog-monitor-utils';
import { setupReplace } from './load';
import { SDK_VERSION, SDK_NAME } from 'frog-monitor-shared';

export * from './replace';
export * from './handleEvents';
export * from './load';

function webInit(options: InitOptions = {}): void {
  if (!('XMLHttpRequest' in _global) || options.disabled) return;
  initOptions(options);
  setupReplace;
}

function init(options: InitOptions = {}): void {
  webInit(options);
}

export { SDK_VERSION, SDK_NAME, init, log };
