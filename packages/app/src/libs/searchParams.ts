export const convertSearchParamsToObject = (
  searchParams: URLSearchParams,
): Record<string, string | string[]> => {
  const obj: Record<string, string[]> = {};

  for (const [key, value] of Array.from(searchParams.entries())) {
    if (obj[key]) {
      obj[key].push(value);
    } else {
      obj[key] = [value];
    }
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (value.length === 1) return [key, value[0]];
      return [key, value];
    }),
  );
};
