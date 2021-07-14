export function shuffleArray<T>(array: Array<T>): Array<T> {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Split an array into two arrays based on a boolean predicate test.
 * 
 * @param array array to operate on
 * @param predicate boolean test for each item in the array
 * @returns a tuple containing two arrays, the first with items matching the predicate,
 * the second with the remaining items.
 */
export function partitionArray<T>(array: Array<T>, predicate: (item: T) => boolean): [T[], T[]] {
  return array.reduce((acc, current) => {
    if (predicate(current)) {
      acc[0].push(current);
    } else {
      acc[1].push(current);
    }
    return acc;
  }, [[] as T[], [] as T[]]);
}
