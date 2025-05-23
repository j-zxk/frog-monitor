import { isPerformanceSupported } from '../utils/isSupported';

const hasMark = (markName: string) => {
  if (!isPerformanceSupported()) {
    console.error('browser do not support performance');
    return;
  }

  return performance.getEntriesByName(markName).length > 0;
};

const getMark = (markName: string) => {
  if (!isPerformanceSupported()) {
    console.error('browser do not support performance');
    return;
  }

  // performance.getEntriesByName() returns an array of PerformanceEntry objects currently present in the performance timeline with the given name and type.
  return performance.getEntriesByName(markName).pop();
};

const setMark = (markName: string): void | undefined => {
  if (!isPerformanceSupported()) {
    console.error('browser do not support performance');
    return;
  }

  performance.mark(markName);
};

const clearMark = (markName: string): void | undefined => {
  if (!isPerformanceSupported()) {
    console.error('browser do not support performance');
    return;
  }

  performance.clearMarks(markName);
};

export { hasMark, getMark, setMark, clearMark };
