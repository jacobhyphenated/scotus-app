export function whenDefined<T> (value: T | null | undefined, callback: (v: T) => void): void {
  if (!!value) {
    callback(value);
  }
}

export function groupBy<T, U extends keyof T>(array: T[], by: U): Map<T[U], T[]> {
  const map = new Map<T[U], T[]>();
  array.reduce((acc, value) => {
    if (map.has(value[by])) {
      map.get(value[by])?.push(value);
    } else {
      map.set(value[by], [value]);
    }
    return acc;
  }, map);
  return map;
}