import { createOperatorSubscriber } from './OperatorSubscriber';
import { OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';

type MapProject<T, R> = (value: T, index: number) => R;

export function map<T, R>(project: MapProject<T, R>): OperatorFunction<T, R>;
/** @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8. */
export function map<T, R, A>(project: (this: A, value: T, index: number) => R, thisArg: A): OperatorFunction<T, R>;

/**
 * Applies a projection function to each source value and emits the projected
 * values in the same order.
 */
export function map<T, R>(project: MapProject<T, R>, thisArg?: any): OperatorFunction<T, R> {
  return operate((source, subscriber) => {
    let index = 0;

    source.subscribe(
      createOperatorSubscriber(subscriber, (value: T) => {
        const currentIndex = index++;
        const projectedValue = project.call(thisArg, value, currentIndex);

        subscriber.next(projectedValue);
      })
    );
  });
}
