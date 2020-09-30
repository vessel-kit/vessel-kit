const cborSortCompareFn = (a: string, b: string): number => a.length - b.length || a.localeCompare(b);

export function sortKeys(input: any, compareFn: (a: any, b: any) => number = cborSortCompareFn): any {
  if (typeof input !== 'object' || Array.isArray(input)) {
    return input;
  }
  return Object.keys(input)
    .sort(compareFn)
    .reduce<Record<string, any>>((acc, prop) => {
      acc[prop] = sortKeys(input[prop], compareFn);
      return acc;
    }, {});
}
