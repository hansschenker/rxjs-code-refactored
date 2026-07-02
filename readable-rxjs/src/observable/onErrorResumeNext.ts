import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { ObservableInputTuple } from '../../../upstream-rxjs/src/internal/types';
import { argsOrArgArray } from '../../../upstream-rxjs/src/internal/util/argsOrArgArray';
import { OperatorSubscriber } from '../operators/OperatorSubscriber';
import { noop } from '../../../upstream-rxjs/src/internal/util/noop';
import { innerFrom } from './innerFrom';

export function onErrorResumeNext<A extends readonly unknown[]>(sources: [...ObservableInputTuple<A>]): Observable<A[number]>;
export function onErrorResumeNext<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A[number]>;

/**
 * When any of the provided Observable emits a complete or an error notification, it immediately subscribes to the next one
 * that was passed.
 *
 * <span class="informal">Execute series of Observables no matter what, even if it means swallowing errors.</span>
 *
 * ![](onErrorResumeNext.png)
 *
 * `onErrorResumeNext` will subscribe to each observable source it is provided, in order.
 * If the source it's subscribed to emits an error or completes, it will move to the next source
 * without error.
 *
 * If `onErrorResumeNext` is provided no arguments, or a single, empty array, it will return {@link EMPTY}.
 *
 * `onErrorResumeNext` is basically {@link concat}, only it will continue, even if one of its
 * sources emits an error.
 *
 * Note that there is no way to handle any errors thrown by sources via the result of
 * `onErrorResumeNext`. If you want to handle errors thrown in any given source, you can
 * always use the {@link catchError} operator on them before passing them into `onErrorResumeNext`.
 *
 * ## Example
 *
 * Subscribe to the next Observable after map fails
 *
 * ```ts
 * import { onErrorResumeNext, of, map } from 'rxjs';
 *
 * onErrorResumeNext(
 *   of(1, 2, 3, 0).pipe(
 *     map(x => {
 *       if (x === 0) {
 *         throw Error();
 *       }
 *       return 10 / x;
 *     })
 *   ),
 *   of(1, 2, 3)
 * )
 * .subscribe({
 *   next: value => console.log(value),
 *   error: err => console.log(err),     // Will never be called.
 *   complete: () => console.log('done')
 * });
 *
 * // Logs:
 * // 10
 * // 5
 * // 3.3333333333333335
 * // 1
 * // 2
 * // 3
 * // 'done'
 * ```
 *
 * @see {@link concat}
 * @see {@link catchError}
 *
 * @param sources `ObservableInput`s passed either directly or as an array.
 * @return An Observable that concatenates all sources, one after the other,
 * ignoring all errors, such that any error causes it to move on to the next source.
 */
export function onErrorResumeNext<A extends readonly unknown[]>(
  ...sources: [[...ObservableInputTuple<A>]] | [...ObservableInputTuple<A>]
): Observable<A[number]> {
  const nextSources: ObservableInputTuple<A> = argsOrArgArray(sources) as any;

  return new Observable((subscriber) => {
    let sourceIndex = 0;

    const subscribeToNextSource = (): void => {
      if (sourceIndex >= nextSources.length) {
        // We've run out of sources: the result is done, regardless of how
        // many of the sources errored along the way.
        subscriber.complete();
        return;
      }

      let nextSource: Observable<A[number]>;
      try {
        nextSource = innerFrom(nextSources[sourceIndex++]);
      } catch (err) {
        // Even a source that cannot be converted to an Observable is
        // "swallowed" like an error notification: just move on to the next.
        subscribeToNextSource();
        return;
      }

      // Both error and complete are replaced with `noop`, so the inner
      // subscriber simply unsubscribes on either notification without
      // forwarding it downstream.
      const innerSubscriber = new OperatorSubscriber(subscriber, undefined, noop, noop);
      nextSource.subscribe(innerSubscriber);

      // Adding the teardown AFTER subscribing is what chains the sources: if
      // the inner subscriber is already closed (source errored or completed,
      // possibly synchronously), the teardown runs immediately; otherwise it
      // runs when the source later errors or completes.
      innerSubscriber.add(subscribeToNextSource);
    };

    subscribeToNextSource();
  });
}
