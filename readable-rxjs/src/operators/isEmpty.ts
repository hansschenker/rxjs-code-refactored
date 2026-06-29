import { OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Emits `false` as soon as the source emits, or `true` if it completes empty.
 */
export function isEmpty<T>(): OperatorFunction<T, boolean> {
  return operate((source, subscriber) => {
    const emitNotEmptyAndComplete = () => {
      subscriber.next(false);
      subscriber.complete();
    };

    const emitEmptyAndComplete = () => {
      subscriber.next(true);
      subscriber.complete();
    };

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        emitNotEmptyAndComplete,
        emitEmptyAndComplete
      )
    );
  });
}
