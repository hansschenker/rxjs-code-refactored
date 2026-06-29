import { ObservableInput, ObservedValueOf, OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { switchMap } from './switchMap';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';

// TODO: Generate a marble diagram for these docs.

/**
 * Applies an accumulator function over the source Observable where the
 * accumulator function itself returns an Observable, emitting values
 * only from the most recently returned Observable.
 *
 * <span class="informal">It's like {@link mergeScan}, but only the most recent
 * Observable returned by the accumulator is merged into the outer Observable.</span>
 *
 * @see {@link scan}
 * @see {@link mergeScan}
 * @see {@link switchMap}
 *
 * @param accumulator
 * The accumulator function called on each source value.
 * @param seed The initial accumulation value.
 * @return A function that returns an observable of the accumulated values.
 */
export function switchScan<T, R, O extends ObservableInput<any>>(
  accumulator: (acc: R, value: T, index: number) => O,
  seed: R
): OperatorFunction<T, ObservedValueOf<O>> {
  return operate((source, subscriber) => {
    let accumulatorState = seed;

    const projectWithCurrentState = (value: T, index: number) =>
      accumulator(accumulatorState, value, index);

    const updateStateAndEmit = (_: T, innerValue: ObservedValueOf<O>) => {
      accumulatorState = innerValue;
      return innerValue;
    };

    switchMap(
      projectWithCurrentState,
      updateStateAndEmit
    )(source).subscribe(subscriber);

    return () => {
      accumulatorState = null!;
    };
  });
}
