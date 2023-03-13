export const compareStringArrays = (
  a: Optional<string[]>,
  b: Optional<string[]>,
): boolean => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b || a.length !== b.length) {
    return false;
  }
  for (const el of a) {
    if (!b.includes(el)) {
      return false;
    }
  }
  return true;
};

export const isDefined = <T>(a: T | undefined | null): a is T => {
  return typeof a !== 'undefined' && a !== null;
};

export const removeUndefineds = <T>(a: Optional<T>[]): T[] => {
  const newArray: T[] = [];
  for (const item of a) {
    if (isDefined(item)) {
      newArray.push(item);
    }
  }
  return newArray;
};
