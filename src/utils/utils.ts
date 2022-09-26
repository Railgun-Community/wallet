export const compareStringArrays = (a?: string[], b?: string[]): boolean => {
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
