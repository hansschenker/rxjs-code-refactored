import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { innerFrom } from '../observable/innerFrom';
import { Subject } from '../../../upstream-rxjs/src/internal/Subject';
import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';

import { MonoTypeOperatorFunction, ObservableInput } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Returns an Observable that mirrors the source Observable with the exception of a `complete`. If the source
 * Observable calls `complete`, this method will emit to the Observable returned from `notifier`. If that Observable
 * calls `complete` or `error`, then this method will call `complete` or `error` on the child subscription. Otherwise
 * this method will resubscribe to the source Observable.
 *
 * ![](repeatWhen.png)
 *
 * ## Example
 *
 * Repeat a message stream on click
 *
 * ```ts
 * import { of, fromEvent, repeatWhen } from 'rxjs';
 *
 * const source = of('Repeat message');
 * const documentClick$ = fromEvent(document, 'click');
 *
 * const result = source.pipe(repeatWhen(() => documentClick$));
 *
 * result.subscribe(data => console.log(data))
 * ```
 *
 * @see {@link repeat}
 * @see {@link retry}
 * @see {@link retryWhen}
 *
 * @param notifier Function that receives an Observable of notifications with
 * which a user can `complete` or `error`, aborting the repetition.
 * @return A function that returns an Observable that mirrors the source
 * Observable with the exception of a `complete`.
 * @deprecated Will be removed in v9 or v10. Use {@link repeat}'s {@link RepeatConfig#delay delay} option instead.
 * Instead of `repeatWhen(() => notify$)`, use: `repeat({ delay: () => notify$ })`.
 */
export function repeatWhen<T>(notifier: (notifications: Observable<void>) => ObservableInput<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let sourceSubscription: Subscription | null;
    let needsSynchronousResubscribe = false;
    let completionsSubject: Subject<void>;
    let isNotifierComplete = false;
    let isMainComplete = false;

    const completeIfReady = () => isMainComplete && isNotifierComplete && (subscriber.complete(), true);

    const resubscribeOrDefer = () => {
      if (sourceSubscription) {
        subscribeForRepeatWhen();
      } else {
        needsSynchronousResubscribe = true;
      }
    };

    const getCompletionSubject = () => {
      if (!completionsSubject) {
        completionsSubject = new Subject();

        innerFrom(notifier(completionsSubject)).subscribe(
          createOperatorSubscriber(
            subscriber,
            resubscribeOrDefer,
            () => {
              isNotifierComplete = true;
              completeIfReady();
            }
          )
        );
      }
      return completionsSubject;
    };

    const handleSourceComplete = () => {
      isMainComplete = true;
      if (!completeIfReady()) {
        getCompletionSubject().next();
      }
    };

    const subscribeForRepeatWhen = () => {
      isMainComplete = false;

      sourceSubscription = source.subscribe(createOperatorSubscriber(subscriber, undefined, handleSourceComplete));

      if (needsSynchronousResubscribe) {
        sourceSubscription.unsubscribe();
        sourceSubscription = null;
        needsSynchronousResubscribe = false;
        subscribeForRepeatWhen();
      }
    };

    subscribeForRepeatWhen();
  });
}
