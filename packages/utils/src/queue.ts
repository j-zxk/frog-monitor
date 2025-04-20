import { voidFun } from 'frog-monitor-shared';
import { _global } from 'frog-monitor-utils';

export class Queue {
  private micro: Promise<void>;
  private stack: any[] = [];
  private isFlushing = false;

  constructor() {
    if (!('Promise' in _global)) return;
    this.micro = Promise.resolve();
  }

  addFn(fn: voidFun): void {
    if (typeof fn !== 'function') return;
    // 环境降级处理：不支持Promise则立即执行
    if (!('Promise' in _global)) {
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
  flushStack(): void {
    // 复制当前队列并清空原队列（允许执行期间新任务入队）
    const temp = this.stack.slice(0);
    this.stack.length = 0;
    this.isFlushing = false;
    for (let i = 0; i < temp.length; i++) {
      temp[i]();
    }
  }
}
