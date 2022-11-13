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
