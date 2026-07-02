import { Subscriber } from '../../../upstream-rxjs/src/internal/Subscriber';
import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { Subject } from '../../../upstream-rxjs/src/internal/Subject';
import { ObservableInput, OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../observable/innerFrom';

/**
 * Branch out the source Observable values as a nested Observable using a
 * factory function of closing Observables to determine when to start a new
 * window.
 *
 * <span class="informal">It's like {@link bufferWhen}, but emits a nested
 * Observable instead of an array.</span>
 *
 * ![](windowWhen.png)
 *
 * Returns an Observable that emits windows of items it collects from the source
 * Observable. The output Observable emits connected, non-overlapping windows.
 * It emits the current window and opens a new one whenever the Observable
 * produced by the specified `closingSelector` function emits an item. The first
 * window is opened immediately when subscribing to the output Observable.
 *
 * ## Example
 *
 * Emit only the first two clicks events in every window of [1-5] random seconds
 *
 * ```ts
 * import { fromEvent, windowWhen, interval, map, take, mergeAll } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(
 *   windowWhen(() => interval(1000 + Math.random() * 4000)),
 *   map(win => win.pipe(take(2))), // take at most 2 emissions from each window
 *   mergeAll()                     // flatten the Observable-of-Observables
 * );
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link window}
 * @see {@link windowCount}
 * @see {@link windowTime}
 * @see {@link windowToggle}
 * @see {@link bufferWhen}
 *
 * @param closingSelector A function that takes no arguments and returns an
 * {@link ObservableInput} (that gets converted to Observable) that signals
 * (on either `next` or `complete`) when to close the previous window and
 * start a new one.
 * @return A function that returns an Observable of windows, which in turn are
 * Observables.
 */
export function windowWhen<T>(closingSelector: () => ObservableInput<any>): OperatorFunction<T, Observable<T>> {
  return operate((source, subscriber) => {
    let currentWindow: Subject<T> | null;
    let closingSubscriber: Subscriber<any> | undefined;

    const handleError = (err: any) => {
      currentWindow!.error(err);
      subscriber.error(err);
    };

    const openWindow = () => {
      closingSubscriber?.unsubscribe();

      currentWindow?.complete();

      currentWindow = new Subject<T>();
      subscriber.next(currentWindow.asObservable());

      let closingNotifier: Observable<any>;
      try {
        closingNotifier = innerFrom(closingSelector());
      } catch (err) {
        handleError(err);
        return;
      }

      closingNotifier.subscribe((closingSubscriber = createOperatorSubscriber(subscriber, openWindow, openWindow, handleError)));
    };

    openWindow();

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value) => currentWindow!.next(value),
        () => {
          currentWindow!.complete();
          subscriber.complete();
        },
        handleError,
        () => {
          closingSubscriber?.unsubscribe();
          currentWindow = null!;
        }
      )
    );
  });
}
