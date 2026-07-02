import { MonoTypeOperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { EMPTY } from '../observable/empty';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits at most the first `count` source values.
 */
export function take<T>(count: number): MonoTypeOperatorFunction<T> {
  return count <= 0
    ? () => EMPTY
    : operate((source, subscriber) => {
        let seen = 0;

        const emitUntilLimit = (value: T) => {
          const seenAfterThisValue = ++seen;

          if (seenAfterThisValue <= count) {
            subscriber.next(value);

            // Use <= so reentrant emissions that already advanced `seen` still complete.
            if (count <= seenAfterThisValue) {
              subscriber.complete();
            }
          }
        };

        source.subscribe(
          createOperatorSubscriber(subscriber, emitUntilLimit)
        );
      });
}
