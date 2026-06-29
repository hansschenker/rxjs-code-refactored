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
 * Emits whether every source value satisfies `predicate`.
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
