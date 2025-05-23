export const nativeToString = Object.prototype.toString;
function isType(type: string) {
  return function (value: any): boolean {
    return nativeToString.call(value) === `[object ${type}]`;
  };
}

export const variableTypeDetection = {
  isNumber: isType('Number'),
  isString: isType('String'),
  isBoolean: isType('Boolean'),
  isNull: isType('Null'),
  isUndefined: isType('Undefined'),
  isSymbol: isType('Symbol'),
  isFunction: isType('Function'),
  isObject: isType('Object'),
  isArray: isType('Array'),
  isProcess: isType('process'),
  isWindow: isType('Window'),
};

export function isError(wat: any): boolean {
  switch (nativeToString.call(wat)) {
    case '[object Error]':
      return true;
    case '[object Expection]':
      return true;
    case '[object DOMException]':
      return true;
    default:
      return isInstanceof(wat, Error);
  }
}

export function isEmptyObject(obj: Object): boolean {
  return variableTypeDetection.isObject(obj) && Object.keys(obj).length === 0;
}

export function isEmpty(wat: any): boolean {
  return (
    (variableTypeDetection.isString(wat) && wat.trim() === '') || wat === undefined || wat === null
  );
}

export function isInstanceof(wat: any, base: any): boolean {
  try {
    return wat instanceof base;
  } catch (error) {
    return false;
  }
}

export function isExistProperty(obj: Object, key: string | number | symbol): boolean {
  return obj.hasOwnProperty(key);
}
