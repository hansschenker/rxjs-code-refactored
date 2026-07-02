import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';
import { OperatorFunction, ObservableInput } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { innerFrom } from '../observable/innerFrom';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../../../upstream-rxjs/src/internal/util/noop';
import { arrRemove } from '../../../upstream-rxjs/src/internal/util/arrRemove';

/**
 * Buffers the source Observable values starting from an emission from
 * `openings` and ending when the output of `closingSelector` emits.
 *
 * <span class="informal">Collects values from the past as an array. Starts
 * collecting only when `opening` emits, and calls the `closingSelector`
 * function to get an Observable that tells when to close the buffer.</span>
 *
 * ![](bufferToggle.png)
 *
 * Buffers values from the source by opening the buffer via signals from an
 * Observable provided to `openings`, and closing and sending the buffers when
 * a Subscribable or Promise returned by the `closingSelector` function emits.
 *
 * ## Example
 *
 * Every other second, emit the click events from the next 500ms
 *
 * ```ts
 * import { fromEvent, interval, bufferToggle, EMPTY } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const openings = interval(1000);
 * const buffered = clicks.pipe(bufferToggle(openings, i =>
 *   i % 2 ? interval(500) : EMPTY
 * ));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferTime}
 * @see {@link bufferWhen}
 * @see {@link windowToggle}
 *
 * @param openings A Subscribable or Promise of notifications to start new
 * buffers.
 * @param closingSelector A function that takes
 * the value emitted by the `openings` observable and returns a Subscribable or Promise,
 * which, when it emits, signals that the associated buffer should be emitted
 * and cleared.
 * @return A function that returns an Observable of arrays of buffered values.
 */
export function bufferToggle<T, O>(
  openings: ObservableInput<O>,
  closingSelector: (value: O) => ObservableInput<any>
): OperatorFunction<T, T[]> {
  return operate((source, subscriber) => {
    const buffers: T[][] = [];

    const openBuffer = (openValue: O) => {
      const buffer: T[] = [];
      const closingSubscription = new Subscription();

      const emitAndCloseBuffer = () => {
        arrRemove(buffers, buffer);
        subscriber.next(buffer);
        closingSubscription.unsubscribe();
      };

      buffers.push(buffer);
      closingSubscription.add(
        innerFrom(closingSelector(openValue)).subscribe(createOperatorSubscriber(subscriber, emitAndCloseBuffer, noop))
      );
    };

    innerFrom(openings).subscribe(
      createOperatorSubscriber(
        subscriber,
        openBuffer,
        noop
      )
    );

    const addValueToOpenBuffers = (value: T) => {
      for (const buffer of buffers) {
        buffer.push(value);
      }
    };

    const emitAllOpenBuffers = () => {
      while (buffers.length > 0) {
        subscriber.next(buffers.shift()!);
      }
      subscriber.complete();
    };

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        addValueToOpenBuffers,
        emitAllOpenBuffers
      )
    );
  });
}
