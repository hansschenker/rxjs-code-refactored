import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { Falsy, OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';

export function every<T>(predicate: BooleanConstructor): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
/** @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8. */
export function every<T>(
  predicate: BooleanConstructor,
  thisArg: any
): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
/** @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8. */
export function every<T, A>(
  predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean,
  thisArg: A
): OperatorFunction<T, boolean>;
export function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, boolean>;

/**
 * Returns an Observable that emits whether or not every item of the source satisfies the condition specified.
 *
 * <span class="informal">If all values pass predicate before the source completes, emits true before completion,
 * otherwise emit false, then complete.</span>
 *
 * ![](every.png)
 *
 * ## Example
 *
 * A simple example emitting true if all elements are less than 5, false otherwise
 *
 * ```ts
 * import { of, every } from 'rxjs';
 *
 * of(1, 2, 3, 4, 5, 6)
 *   .pipe(every(x => x < 5))
 *   .subscribe(x => console.log(x)); // -> false
 * ```
 *
 * @param predicate A function for determining if an item meets a specified condition.
 * @param thisArg Optional object to use for `this` in the callback.
 * @return A function that returns an Observable of booleans that determines if
 * all items of the source Observable meet the condition specified.
 */
export function every<T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  thisArg?: any
): OperatorFunction<T, boolean> {
  return operate((source, subscriber) => {
    let index = 0;

    const failAndComplete = () => {
      subscriber.next(false);
      subscriber.complete();
    };

    const passAndComplete = () => {
      subscriber.next(true);
      subscriber.complete();
    };

    const testValue = (value: T) => {
      const currentIndex = index++;
      const passed = predicate.call(thisArg, value, currentIndex, source);

      if (!passed) {
        failAndComplete();
      }
    };

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        testValue,
        passAndComplete
      )
    );
  });
}
