import { reduce } from './reduce';
import { MonoTypeOperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { isFunction } from '../../../upstream-rxjs/src/internal/util/isFunction';

/**
 * Emits the smallest source value when the source completes.
 */
export function min<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T> {
  const selectMinimum = isFunction(comparer)
    ? (currentMinimum: T, value: T) => (comparer(currentMinimum, value) < 0 ? currentMinimum : value)
    : (currentMinimum: T, value: T) => (currentMinimum < value ? currentMinimum : value);

  return reduce(selectMinimum);
}
