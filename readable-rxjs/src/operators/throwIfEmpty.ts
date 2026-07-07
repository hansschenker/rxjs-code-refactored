import { EmptyError } from '../../../upstream-rxjs/src/internal/util/EmptyError';
import { MonoTypeOperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * If the source observable completes without emitting a value, it will emit
 * an error. The error will be created at that time by the optional
 * `errorFactory` argument, otherwise, the error will be {@link EmptyError}.
 *
 * ![](throwIfEmpty.png)
 *
 * ## Example
 *
 * Throw an error if the document wasn't clicked within 1 second
 *
 * ```ts
 * import { fromEvent, takeUntil, timer, throwIfEmpty } from 'rxjs';
 *
 * const click$ = fromEvent(document, 'click');
 *
 * click$.pipe(
 *   takeUntil(timer(1000)),
 *   throwIfEmpty(() => new Error('The document was not clicked within 1 second'))
 * )
 * .subscribe({
 *   next() {
 *    console.log('The document was clicked');
 *   },
 *   error(err) {
 *     console.error(err.message);
 *   }
 * });
 * ```
 *
 * @param errorFactory A factory function called to produce the
 * error to be thrown when the source observable completes without emitting a
 * value.
 * @return A function that returns an Observable that throws an error if the
 * source Observable completed without emitting.
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
