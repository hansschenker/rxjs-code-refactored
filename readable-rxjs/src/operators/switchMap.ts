import { Subscriber } from '../../../upstream-rxjs/src/internal/Subscriber';
import { ObservableInput, OperatorFunction, ObservedValueOf } from '../../../upstream-rxjs/src/internal/types';
import { innerFrom } from '../../../upstream-rxjs/src/internal/observable/innerFrom';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

/* tslint:disable:max-line-length */
export function switchMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>>;
/** @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector */
export function switchMap<T, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: undefined
): OperatorFunction<T, ObservedValueOf<O>>;
/** @deprecated The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector */
export function switchMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * Projects each source value to an Observable which is merged in the output
 * Observable, emitting values only from the most recently projected Observable.
 *
 * <span class="informal">Maps each value to an Observable, then flattens all of
 * these inner Observables using {@link switchAll}.</span>
 *
 * ![](switchMap.png)
 *
 * Returns an Observable that emits items based on applying a function that you
 * supply to each item emitted by the source Observable, where that function
 * returns an (so-called "inner") Observable. Each time it observes one of these
 * inner Observables, the output Observable begins emitting the items emitted by
 * that inner Observable. When a new inner Observable is emitted, `switchMap`
 * stops emitting items from the earlier-emitted inner Observable and begins
 * emitting items from the new one. It continues to behave like this for
 * subsequent inner Observables.
 *
 * ## Example
 *
 * Generate new Observable according to source Observable values
 *
 * ```ts
 * import { of, switchMap } from 'rxjs';
 *
 * const switched = of(1, 2, 3).pipe(switchMap(x => of(x, x ** 2, x ** 3)));
 * switched.subscribe(x => console.log(x));
 * // outputs
 * // 1
 * // 1
 * // 1
 * // 2
 * // 4
 * // 8
 * // 3
 * // 9
 * // 27
 * ```
 *
 * Restart an interval Observable on every click event
 *
 * ```ts
 * import { fromEvent, switchMap, interval } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(switchMap(() => interval(1000)));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link concatMap}
 * @see {@link exhaustMap}
 * @see {@link mergeMap}
 * @see {@link switchAll}
 * @see {@link switchMapTo}
 *
 * @param project A function that, when applied to an item emitted by the source
 * Observable, returns an Observable.
 * @return A function that returns an Observable that emits the result of
 * applying the projection function (and the optional deprecated
 * `resultSelector`) to each item emitted by the source Observable and taking
 * only the values from the most recently projected inner Observable.
 */
export function switchMap<T, R, O extends ObservableInput<any>>(
  project: (value: T, index: number) => O,
  resultSelector?: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R
): OperatorFunction<T, ObservedValueOf<O> | R> {
  return operate((source, subscriber) => {
    let activeInnerSubscriber: Subscriber<ObservedValueOf<O>> | null = null;
    let sourceIndex = 0;
    let isSourceComplete = false;

    const completeIfReady = () => {
      if (isSourceComplete && !activeInnerSubscriber) {
        subscriber.complete();
      }
    };

    const createInnerValueHandler = (outerValue: T, outerIndex: number) => {
      let innerIndex = 0;

      return (innerValue: ObservedValueOf<O>) => {
        const projectedValue = resultSelector
          ? resultSelector(outerValue, innerValue, outerIndex, innerIndex++)
          : innerValue;

        subscriber.next(projectedValue);
      };
    };

    const markInnerComplete = () => {
      activeInnerSubscriber = null!;
      completeIfReady();
    };

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (outerValue) => {
          activeInnerSubscriber?.unsubscribe();

          const outerIndex = sourceIndex++;

          innerFrom(project(outerValue, outerIndex)).subscribe(
            (activeInnerSubscriber = createOperatorSubscriber(
              subscriber,
              createInnerValueHandler(outerValue, outerIndex),
              markInnerComplete
            ))
          );
        },
        () => {
          isSourceComplete = true;
          completeIfReady();
        }
      )
    );
  });
}
