import { OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { reduce } from './reduce';

/**
 * Counts source emissions, optionally only those matching `predicate`.
 */
export function count<T>(predicate?: (value: T, index: number) => boolean): OperatorFunction<T, number> {
  const shouldCountValue = predicate ?? (() => true);
  const countMatchingValues = (total: number, value: T, index: number) =>
    shouldCountValue(value, index) ? total + 1 : total;

  return reduce(countMatchingValues, 0);
}
