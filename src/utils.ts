/**
 * Takes a predicate and a list of values and returns a a tuple (2-item array),
 *  with each item containing the subset of the list that matches the predicate
 *  and the complement of the predicate respectively
 * 
 * @sig (T -> Boolean, T[]) -> [T[], T[]]
 * 
 * @param {Function} predicate A predicate to determine which side the element belongs to.
 * @param {Array} arr The list to partition
 * 
 * Inspired by the Ramda function of the same name
 * @see https://ramdajs.com/docs/#partition
 * @see https://gist.github.com/zachlysobey/71ac85046d0d533287ed85e1caa64660
 *
 * @example
 * 
 *     const isNegative: (n: number) => boolean = n => n < 0
 *     const numbers = [1, 2, -4, -7, 4, 22]
 *     partition(isNegative, numbers)
 *     // => [ [-4, -7], [1, 2, 4, 22] ]
 * 
 */
export function partition<T> (
    predicate: (val: T) => boolean,
    arr: Array<T>,
): [Array<T>, Array<T>] {
    const partitioned: [Array<T>, Array<T>] = [[], []]
    arr.forEach((val: T) => {
        const partitionIndex: 0 | 1 = predicate(val) ? 0 : 1
        partitioned[partitionIndex].push(val)
    })
    return partitioned
}

const UNITS = ["B", "KB", "MB", "GB", "TB"];
export function convertBytes(size: number): string {
  for (const u of UNITS) {
    if (size < 1024) {
      return `${size.toFixed(2)} ${u}`;
    }
    size /= 1024;
  }
  return `${size.toFixed(2)} ${UNITS[-1]}`;
}
