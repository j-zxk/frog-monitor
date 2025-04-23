export const roundByFour = (num: number, digits = 4) => {
  try {
    return parseFloat(num.toFixed(digits));
  } catch (error) {
    return num;
  }
};

export const validNumber = (nums: number | Array<number>) => {
  if (Array.isArray(nums)) {
    return nums.every((n) => n >= 0);
  } else {
    return nums >= 0;
  }
};

export const afterLoad = (callback) => {
  if (document.readyState === 'complete') {
    setTimeout(callback);
  } else {
    window.addEventListener('pageshow', callback);
  }
};

export const beforeUnload = (callback) => {
  window.addEventListener('beforeunload', callback);
};

export const unload = (callback) => {
  window.addEventListener('unload', callback);
};
