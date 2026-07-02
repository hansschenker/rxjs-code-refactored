import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';
import { OperatorFunction, SchedulerLike } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { arrRemove } from '../../../upstream-rxjs/src/internal/util/arrRemove';
import { asyncScheduler } from '../scheduler/async';
import { popScheduler } from '../../../upstream-rxjs/src/internal/util/args';
import { executeSchedule } from '../../../upstream-rxjs/src/internal/util/executeSchedule';

export function bufferTime<T>(bufferTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, T[]>;
export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null | undefined,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;
export function bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null | undefined,
  maxBufferSize: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>;

/**
 * Buffers the source Observable values for a specific time period.
 *
 * <span class="informal">Collects values from the past as an array, and emits
 * those arrays periodically in time.</span>
 *
 * ![](bufferTime.png)
 *
 * Buffers values from the source for a specific time duration `bufferTimeSpan`.
 * Unless the optional argument `bufferCreationInterval` is given, it emits and
 * resets the buffer every `bufferTimeSpan` milliseconds. If
 * `bufferCreationInterval` is given, this operator opens the buffer every
 * `bufferCreationInterval` milliseconds and closes (emits and resets) the
 * buffer every `bufferTimeSpan` milliseconds. When the optional argument
 * `maxBufferSize` is specified, the buffer will be closed either after
 * `bufferTimeSpan` milliseconds or when it contains `maxBufferSize` elements.
 *
 * ## Examples
 *
 * Every second, emit an array of the recent click events
 *
 * ```ts
 * import { fromEvent, bufferTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(1000));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds, emit the click events from the next 2 seconds
 *
 * ```ts
 * import { fromEvent, bufferTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const buffered = clicks.pipe(bufferTime(2000, 5000));
 * buffered.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link buffer}
 * @see {@link bufferCount}
 * @see {@link bufferToggle}
 * @see {@link bufferWhen}
 * @see {@link windowTime}
 *
 * @param bufferTimeSpan The amount of time to fill each buffer array.
 * @param otherArgs Other configuration arguments such as:
 * - `bufferCreationInterval` - the interval at which to start new buffers;
 * - `maxBufferSize` - the maximum buffer size;
 * - `scheduler` - the scheduler on which to schedule the intervals that determine buffer boundaries.
 * @return A function that returns an Observable of arrays of buffered values.
 */
export function bufferTime<T>(bufferTimeSpan: number, ...otherArgs: any[]): OperatorFunction<T, T[]> {
  const scheduler = popScheduler(otherArgs) ?? asyncScheduler;
  const bufferCreationInterval = (otherArgs[0] as number) ?? null;
  const maxBufferSize = (otherArgs[1] as number) || Infinity;

  return operate((source, subscriber) => {
    let bufferRecords: BufferRecord<T>[] | null = [];
    let restartOnEmit = false;

    const emitBuffer = (record: BufferRecord<T>) => {
      const { buffer, subs } = record;

      subs.unsubscribe();
      arrRemove(bufferRecords, record);
      subscriber.next(buffer);

      if (restartOnEmit) {
        startBuffer();
      }
    };

    const startBuffer = () => {
      if (bufferRecords) {
        const subs = new Subscription();
        const buffer: T[] = [];
        const record = { buffer, subs };

        subscriber.add(subs);
        bufferRecords.push(record);
        executeSchedule(subs, scheduler, () => emitBuffer(record), bufferTimeSpan);
      }
    };

    if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
      executeSchedule(subscriber, scheduler, startBuffer, bufferCreationInterval, true);
    } else {
      restartOnEmit = true;
    }

    startBuffer();

    const addValueToBuffers = (value: T) => {
      const recordsCopy = bufferRecords!.slice();

      for (const record of recordsCopy) {
        record.buffer.push(value);

        if (maxBufferSize <= record.buffer.length) {
          emitBuffer(record);
        }
      }
    };

    const emitRemainingBuffers = () => {
      while (bufferRecords?.length) {
        subscriber.next(bufferRecords.shift()!.buffer);
      }
      bufferTimeSubscriber?.unsubscribe();
      subscriber.complete();
      subscriber.unsubscribe();
    };

    const bufferTimeSubscriber = createOperatorSubscriber(
      subscriber,
      addValueToBuffers,
      emitRemainingBuffers,
      undefined,
      () => (bufferRecords = null)
    );

    source.subscribe(bufferTimeSubscriber);
  });
}

interface BufferRecord<T> {
  buffer: T[];
  subs: Subscription;
}
