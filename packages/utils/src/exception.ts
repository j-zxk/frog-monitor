import { voidFun } from 'frog-monitor-shared';

export function nativeTryCatch(fn: voidFun, errorFn?: (err: any) => void): void {
  try {
    fn();
  } catch (error) {
    console.log('error', error);
    if (errorFn) {
      errorFn(error);
    }
  }
}
