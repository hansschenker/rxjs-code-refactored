import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { OperatorFunction, ObservableInput } from '../../../upstream-rxjs/src/internal/types';
import { Subject } from '../../../upstream-rxjs/src/internal/Subject';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { noop } from '../../../upstream-rxjs/src/internal/util/noop';
import { innerFrom } from '../observable/innerFrom';

/**
 * Branch out the source Observable values as a nested Observable whenever
 * `windowBoundaries` emits.
 *
 * <span class="informal">It's like {@link buffer}, but emits a nested Observable
 * instead of an array.</span>
 *
 * ![](window.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits connected, non-overlapping
 * windows. It emits the current window and opens a new one whenever the
 * `windowBoundaries` emits an item. `windowBoundaries` can be any type that
 * `ObservableInput` accepts. It internally gets converted to an Observable.
 * Because each window is an Observable, the output is a higher-order Observable.
 *
 * ## Example
 *
 * In every window of 1 second each, emit at most 2 click events
 *
 * ```ts
 * import { fromEvent, interval, window, map, take, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const sec = interval(1000);
 * const result = clicks.pipe(
 *   window(sec),
 *   map(win => win.pipe(take(2))), // take at most 2 emissions from each window
 *   mergeAll()                     // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link windowWhen}
 * @see {@link buffer}
 *
 * @param windowBoundaries An `ObservableInput` that completes the
 * previous window and starts a new window.
 * @return A function that returns an Observable of windows, which are
 * Observables emitting values of the source Observable.
 */
export function window<T>(windowBoundaries: ObservableInput<any>): OperatorFunction<T, Observable<T>> {
  return operate((source, subscriber) => {
    let windowSubject: Subject<T> = new Subject<T>();

    const errorHandler = (err: any) => {
      windowSubject.error(err);
      subscriber.error(err);
    };

    const emitCurrentWindow = () => subscriber.next(windowSubject.asObservable());

    const closeCurrentWindowAndOpenNext = () => {
      windowSubject.complete();
      windowSubject = new Subject<T>();
      emitCurrentWindow();
    };

    emitCurrentWindow();

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value) => windowSubject?.next(value),
        () => {
          windowSubject.complete();
          subscriber.complete();
        },
        errorHandler
      )
    );

    innerFrom(windowBoundaries).subscribe(
      createOperatorSubscriber(
        subscriber,
        closeCurrentWindowAndOpenNext,
        noop,
        errorHandler
      )
    );

    return () => {
      windowSubject?.unsubscribe();
      windowSubject = null!;
    };
  });
}
