import { OperatorFunction, MonoTypeOperatorFunction, TruthyTypesOf } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

export function takeWhile<T>(predicate: BooleanConstructor, inclusive: true): MonoTypeOperatorFunction<T>;
export function takeWhile<T>(predicate: BooleanConstructor, inclusive: false): OperatorFunction<T, TruthyTypesOf<T>>;
export function takeWhile<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export function takeWhile<T, S extends T>(predicate: (value: T, index: number) => value is S, inclusive: false): OperatorFunction<T, S>;
export function takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive?: boolean): MonoTypeOperatorFunction<T>;

/**
 * Emits source values while `predicate` passes, optionally including the first failure.
 */
export function takeWhile<T>(predicate: (value: T, index: number) => boolean, inclusive = false): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let index = 0;

    const testAndMaybeTake = (value: T) => {
      const currentIndex = index++;
      const shouldContinue = predicate(value, currentIndex);

      if (shouldContinue || inclusive) {
        subscriber.next(value);
      }

      if (!shouldContinue) {
        subscriber.complete();
      }
    };

    source.subscribe(
      createOperatorSubscriber(subscriber, testAndMaybeTake)
    );
  });
}
