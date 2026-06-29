import { OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits `[previous, current]` tuples after the source has emitted twice.
 */
export function pairwise<T>(): OperatorFunction<T, [T, T]> {
  return operate((source, subscriber) => {
    let previousValue: T;
    let hasPreviousValue = false;

    const rememberAndMaybeEmitPair = (value: T) => {
      const previous = previousValue;
      previousValue = value;

      if (hasPreviousValue) {
        subscriber.next([previous, value]);
      }

      hasPreviousValue = true;
    };

    source.subscribe(
      createOperatorSubscriber(subscriber, rememberAndMaybeEmitPair)
    );
  });
}
