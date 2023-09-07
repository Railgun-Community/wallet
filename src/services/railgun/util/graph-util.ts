export const removeDuplicatesByID = <T extends { id: string }>(
  array: T[],
): T[] => {
  const seen = new Set();
  return array.filter((item: T) => {
    const duplicate = seen.has(item.id);
    seen.add(item.id);
    return !duplicate;
  });
};
