import { Subject } from '../../../upstream-rxjs/src/internal/Subject';
import { asyncScheduler } from '../../../upstream-rxjs/src/internal/scheduler/async';
import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';
import { Observer, OperatorFunction, SchedulerLike } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { arrRemove } from '../../../upstream-rxjs/src/internal/util/arrRemove';
import { popScheduler } from '../../../upstream-rxjs/src/internal/util/args';
import { executeSchedule } from '../../../upstream-rxjs/src/internal/util/executeSchedule';

export function windowTime<T>(windowTimeSpan: number, scheduler?: SchedulerLike): OperatorFunction<T, Observable<T>>;
export function windowTime<T>(
  windowTimeSpan: number,
  windowCreationInterval: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, Observable<T>>;
export function windowTime<T>(
  windowTimeSpan: number,
  windowCreationInterval: number | null | void,
  maxWindowSize: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, Observable<T>>;

/**
 * Branch out the source Observable values as a nested Observable periodically
 * in time.
 *
 * <span class="informal">It's like {@link bufferTime}, but emits a nested
 * Observable instead of an array.</span>
 *
 * ![](windowTime.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable starts a new window periodically, as
 * determined by the `windowCreationInterval` argument. It emits each window
 * after a fixed timespan, specified by the `windowTimeSpan` argument. When the
 * source Observable completes or encounters an error, the output Observable
 * emits the current window and propagates the notification from the source
 * Observable. If `windowCreationInterval` is not provided, the output
 * Observable starts a new window when the previous window of duration
 * `windowTimeSpan` completes. If `maxWindowCount` is provided, each window
 * will emit at most fixed number of values. Window will complete immediately
 * after emitting last value and next one still will open as specified by
 * `windowTimeSpan` and `windowCreationInterval` arguments.
 *
 * ## Examples
 *
 * In every window of 1 second each, emit at most 2 click events
 *
 * ```ts
 * import { fromEvent, windowTime, map, take, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000),
 *   map(win => win.pipe(take(2))), // take at most 2 emissions from each window
 *   mergeAll()                     // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Every 5 seconds start a window 1 second long, and emit at most 2 click events per window
 *
 * ```ts
 * import { fromEvent, windowTime, map, take, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000, 5000),
 *   map(win => win.pipe(take(2))), // take at most 2 emissions from each window
 *   mergeAll()                     // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * Same as example above but with `maxWindowCount` instead of `take`
 *
 * ```ts
 * import { fromEvent, windowTime, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowTime(1000, 5000, 2), // take at most 2 emissions from each window
 *   mergeAll()                 // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link bufferTime}
 *
 * @param windowTimeSpan The amount of time, in milliseconds, to fill each window.
 * @param windowCreationInterval The interval at which to start new
 * windows.
 * @param maxWindowSize Max number of
 * values each window can emit before completion.
 * @param scheduler The scheduler on which to schedule the
 * intervals that determine window boundaries.
 * @return A function that returns an Observable of windows, which in turn are
 * Observables.
 */
export function windowTime<T>(windowTimeSpan: number, ...otherArgs: any[]): OperatorFunction<T, Observable<T>> {
  const scheduler = popScheduler(otherArgs) ?? asyncScheduler;
  const windowCreationInterval = (otherArgs[0] as number) ?? null;
  const maxWindowSize = (otherArgs[1] as number) || Infinity;

  return operate((source, subscriber) => {
    let windowRecords: WindowRecord<T>[] | null = [];
    let restartOnClose = false;

    const closeWindow = (record: WindowRecord<T>) => {
      const { window, subs } = record;

      window.complete();
      subs.unsubscribe();
      arrRemove(windowRecords, record);

      if (restartOnClose) {
        startWindow();
      }
    };

    const startWindow = () => {
      if (windowRecords) {
        const subs = new Subscription();
        const window = new Subject<T>();
        const record = {
          window,
          subs,
          seen: 0,
        };

        subscriber.add(subs);
        windowRecords.push(record);
        subscriber.next(window.asObservable());
        executeSchedule(subs, scheduler, () => closeWindow(record), windowTimeSpan);
      }
    };

    if (windowCreationInterval !== null && windowCreationInterval >= 0) {
      executeSchedule(subscriber, scheduler, startWindow, windowCreationInterval, true);
    } else {
      restartOnClose = true;
    }

    startWindow();

    const forEachWindowRecord = (cb: (record: WindowRecord<T>) => void) => windowRecords!.slice().forEach(cb);

    const terminate = (cb: (consumer: Observer<any>) => void) => {
      forEachWindowRecord(({ window }) => cb(window));
      cb(subscriber);
      subscriber.unsubscribe();
    };

    const sendValueToOpenWindows = (value: T) => {
      forEachWindowRecord((record) => {
        record.window.next(value);

        if (maxWindowSize <= ++record.seen) {
          closeWindow(record);
        }
      });
    };

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        sendValueToOpenWindows,
        () => terminate((consumer) => consumer.complete()),
        (err) => terminate((consumer) => consumer.error(err))
      )
    );

    return () => {
      windowRecords = null!;
    };
  });
}

interface WindowRecord<T> {
  seen: number;
  window: Subject<T>;
  subs: Subscription;
}
