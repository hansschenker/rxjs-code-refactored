import { MonoTypeOperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { filter } from './filter';

/**
 * Drops the first `count` source values.
 */
export function skip<T>(count: number): MonoTypeOperatorFunction<T> {
  const isPastSkippedPrefix = (_: T, index: number) => count <= index;

  return filter(isPastSkippedPrefix);
}
