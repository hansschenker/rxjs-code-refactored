import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { innerFrom } from '../observable/innerFrom';
import { Subject } from '../../../upstream-rxjs/src/internal/Subject';
import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';

import { MonoTypeOperatorFunction, ObservableInput } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/**
 * Returns an Observable that mirrors the source Observable with the exception of an `error`. If the source Observable
 * calls `error`, this method will emit the Throwable that caused the error to the `ObservableInput` returned from `notifier`.
 * If that Observable calls `complete` or `error` then this method will call `complete` or `error` on the child
 * subscription. Otherwise this method will resubscribe to the source Observable.
 *
 * ![](retryWhen.png)
 *
 * Retry an observable sequence on error based on custom criteria.
 *
 * ## Example
 *
 * ```ts
 * import { interval, map, retryWhen, tap, delayWhen, timer } from 'rxjs';
 *
 * const source = interval(1000);
 * const result = source.pipe(
 *   map(value => {
 *     if (value > 5) {
 *       // error will be picked up by retryWhen
 *       throw value;
 *     }
 *     return value;
 *   }),
 *   retryWhen(errors =>
 *     errors.pipe(
 *       // log error message
 *       tap(value => console.log(`Value ${ value } was too high!`)),
 *       // restart in 5 seconds
 *       delayWhen(value => timer(value * 1000))
 *     )
 *   )
 * );
 *
 * result.subscribe(value => console.log(value));
 *
 * // results:
 * // 0
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 'Value 6 was too high!'
 * // - Wait 5 seconds then repeat
 * ```
 *
 * @see {@link retry}
 *
 * @param notifier Function that receives an Observable of notifications with which a
 * user can `complete` or `error`, aborting the retry.
 * @return A function that returns an Observable that mirrors the source
 * Observable with the exception of an `error`.
 * @deprecated Will be removed in v9 or v10, use {@link retry}'s `delay` option instead.
 * Will be removed in v9 or v10. Use {@link retry}'s {@link RetryConfig#delay delay} option instead.
 * Instead of `retryWhen(() => notify$)`, use: `retry({ delay: () => notify$ })`.
 */
export function retryWhen<T>(notifier: (errors: Observable<any>) => ObservableInput<any>): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let sourceSubscription: Subscription | null;
    let needsSynchronousResubscribe = false;
    let errorsSubject: Subject<any>;

    const resubscribeOrDefer = () => {
      if (sourceSubscription) {
        subscribeForRetryWhen();
      } else {
        needsSynchronousResubscribe = true;
      }
    };

    const createErrorsSubjectIfNeeded = () => {
      if (!errorsSubject) {
        errorsSubject = new Subject();
        innerFrom(notifier(errorsSubject)).subscribe(createOperatorSubscriber(subscriber, resubscribeOrDefer));
      }
    };

    const handleSourceError = (err: any) => {
      createErrorsSubjectIfNeeded();
      errorsSubject.next(err);
    };

    const subscribeForRetryWhen = () => {
      sourceSubscription = source.subscribe(createOperatorSubscriber(subscriber, undefined, undefined, handleSourceError));

      if (needsSynchronousResubscribe) {
        sourceSubscription.unsubscribe();
        sourceSubscription = null;
        needsSynchronousResubscribe = false;
        subscribeForRetryWhen();
      }
    };

    subscribeForRetryWhen();
  });
}
