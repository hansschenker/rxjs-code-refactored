import { EmptyError } from '../../../upstream-rxjs/src/internal/util/EmptyError';
import { MonoTypeOperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Mirrors source values, or errors if the source completes empty.
 */
export function throwIfEmpty<T>(errorFactory: () => any = defaultErrorFactory): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let hasValue = false;

    const emitSourceValue = (value: T) => {
      hasValue = true;
      subscriber.next(value);
    };

    const completeOrThrowIfEmpty = () => {
      if (hasValue) {
        subscriber.complete();
        return;
      }

      subscriber.error(errorFactory());
    };

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        emitSourceValue,
        completeOrThrowIfEmpty
      )
    );
  });
}

function defaultErrorFactory() {
  return new EmptyError();
}
