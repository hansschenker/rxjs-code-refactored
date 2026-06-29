import { Falsy, MonoTypeOperatorFunction, OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

export function skipWhile<T>(predicate: BooleanConstructor): OperatorFunction<T, Extract<T, Falsy> extends never ? never : T>;
export function skipWhile<T>(predicate: (value: T, index: number) => true): OperatorFunction<T, never>;
export function skipWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;

/**
 * Drops source values while `predicate` passes, then mirrors the rest.
 */
export function skipWhile<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let isTaking = false;
    let index = 0;

    const skipOrEmit = (value: T) => {
      if (!isTaking) {
        const currentIndex = index++;
        isTaking = !predicate(value, currentIndex);
      }

      if (isTaking) {
        subscriber.next(value);
      }
    };

    source.subscribe(
      createOperatorSubscriber(subscriber, skipOrEmit)
    );
  });
}
