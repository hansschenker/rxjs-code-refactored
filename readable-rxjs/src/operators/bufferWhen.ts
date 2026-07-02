import { Subscriber } from '../../../upstream-rxjs/src/internal/Subscriber';
import { ObservableInput, OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { noop } from '../../../upstream-rxjs/src/internal/util/noop';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';

/**
 * Buffers the source Observable values, using a factory function of closing
 * Observables to determine when to close, emit, and reset the buffer.
 *
 * <span class="informal">Collects values from the past as an array. When it
 * starts collecting values, it calls a function that returns an Observable that
 * tells when to close the buffer and restart collecting.</span>
 *
 * ![](bufferWhen.svg)
 *
 * Opens a buffer immediately, then closes the buffer when the observable
 * returned by calling `closingSelector` function emits a value. When it closes
 * the buffer, it immediately opens a new buffer and repeats the process.
 *
 * ## Example
 *
 * Emit an array of the last clicks every [1-5] random seconds
 *
 * ```ts
 * import { fromEvent, bufferWhen, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(
 *   bufferWhen(() => interval(1000 + Math.random() * 4000))
 * );
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link windowWhen}
 *
 * @param closingSelector A function that takes no arguments and returns an
 * Observable that signals buffer closure.
 * @return A function that returns an Observable of arrays of buffered values.
 */
export function bufferWhen<T>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, T[]> {
  return operate((source, subscriber) => {
    let buffer: T[] | null = null;
    let closingSubscriber: Subscriber<T> | null = null;

    const closeCurrentBufferAndOpenNext = () => {
      closingSubscriber?.unsubscribe();

      const bufferToEmit = buffer;
      buffer = [];

      if (bufferToEmit) {
        subscriber.next(bufferToEmit);
      }

      innerFrom(closingSelector()).subscribe(
        (closingSubscriber = createOperatorSubscriber(subscriber, closeCurrentBufferAndOpenNext, noop))
      );
    };

    closeCurrentBufferAndOpenNext();

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value) => buffer?.push(value),
        () => {
          buffer && subscriber.next(buffer);
          subscriber.complete();
        },
        undefined,
        () => (buffer = closingSubscriber = null!)
      )
    );
  });
}
