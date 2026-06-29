import { reduce } from './reduce';
import { MonoTypeOperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { isFunction } from '../../../upstream-rxjs/src/internal/util/isFunction';

/**
 * Emits the largest source value when the source completes.
 */
export function max<T>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T> {
  const selectMaximum = isFunction(comparer)
    ? (currentMaximum: T, value: T) => (comparer(currentMaximum, value) > 0 ? currentMaximum : value)
    : (currentMaximum: T, value: T) => (currentMaximum > value ? currentMaximum : value);

  return reduce(selectMaximum);
}
