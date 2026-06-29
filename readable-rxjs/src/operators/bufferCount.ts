import { OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { arrRemove } from '../../../upstream-rxjs/src/internal/util/arrRemove';

/**
 * Buffers the source Observable values until the size hits the maximum
 * `bufferSize` given.
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * that array only when its size reaches `bufferSize`.</span>
 *
 * ![](bufferCount.png)
 *
 * Buffers a number of values from the source Observable by `bufferSize` then
 * emits the buffer and clears it, and starts a new buffer each
 * `startBufferEvery` values. If `startBufferEvery` is not provided or is
 * `null`, then new buffers are started immediately at the start of the source
 * and when each buffer closes and is emitted.
 *
 * ## Examples
 *
 * Emit the last two click events as an array
 *
 * ```ts
 * import { fromEvent, bufferCount } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferCount(2));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * On every click, emit the last two click events as an array
 *
 * ```ts
 * import { fromEvent, bufferCount } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferCount(2, 1));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link buffer}
 * @see {@link bufferTime}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link pairwise}
 * @see {@link windowCount}
 *
 * @param bufferSize The maximum size of the buffer emitted.
 * @param startBufferEvery Interval at which to start a new buffer.
 * For example if `startBufferEvery` is `2`, then a new buffer will be started
 * on every other value from the source. A new buffer is started at the
 * beginning of the source by default.
 * @return A function that returns an Observable of arrays of buffered values.
 */
export function bufferCount<T>(bufferSize: number, startBufferEvery: number | null = null): OperatorFunction<T, T[]> {
  // If no `startBufferEvery` value was supplied, then we're
  // opening and closing on the bufferSize itself.
  startBufferEvery = startBufferEvery ?? bufferSize;

  return operate((source, subscriber) => {
    let buffers: T[][] = [];
    let count = 0;

    const startBufferIfNeeded = () => {
      if (count++ % startBufferEvery! === 0) {
        buffers.push([]);
      }
    };

    const collectFullBuffers = (value: T) => {
      let fullBuffers: T[][] | null = null;

      for (const buffer of buffers) {
        buffer.push(value);

        if (bufferSize <= buffer.length) {
          fullBuffers = fullBuffers ?? [];
          fullBuffers.push(buffer);
        }
      }

      return fullBuffers;
    };

    const emitAndRemoveFullBuffers = (fullBuffers: T[][] | null) => {
      if (!fullBuffers) {
        return;
      }

      for (const buffer of fullBuffers) {
        arrRemove(buffers, buffer);
        subscriber.next(buffer);
      }
    };

    const emitRemainingBuffers = () => {
      for (const buffer of buffers) {
        subscriber.next(buffer);
      }
      subscriber.complete();
    };

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value) => {
          startBufferIfNeeded();
          emitAndRemoveFullBuffers(collectFullBuffers(value));
        },
        emitRemainingBuffers,
        undefined,
        () => {
          buffers = null!;
        }
      )
    );
  });
}
