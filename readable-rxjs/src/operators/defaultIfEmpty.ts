import { OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Mirrors source values, or emits `defaultValue` if the source completes empty.
 */
export function defaultIfEmpty<T, R>(defaultValue: R): OperatorFunction<T, T | R> {
  return operate((source, subscriber) => {
    let hasValue = false;

    const emitSourceValue = (value: T) => {
      hasValue = true;
      subscriber.next(value);
    };

    const completeWithDefaultIfEmpty = () => {
      if (!hasValue) {
        subscriber.next(defaultValue);
      }

      subscriber.complete();
    };

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        emitSourceValue,
        completeWithDefaultIfEmpty
      )
    );
  });
}
