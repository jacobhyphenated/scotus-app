export function whenDefined<T> (value: T | null | undefined, callback: (v: T) => void): void {
  if (!!value) {
    callback(value);
  }
}