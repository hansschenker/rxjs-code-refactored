import { OperatorFunction, ObservableInputTuple } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber } from './OperatorSubscriber';
import { innerFrom } from '../../../upstream-rxjs/src/internal/observable/innerFrom';
import { identity } from '../../../upstream-rxjs/src/internal/util/identity';
import { noop } from '../../../upstream-rxjs/src/internal/util/noop';
import { popResultSelector } from '../../../upstream-rxjs/src/internal/util/args';

export function withLatestFrom<T, O extends unknown[]>(...inputs: [...ObservableInputTuple<O>]): OperatorFunction<T, [T, ...O]>;

export function withLatestFrom<T, O extends unknown[], R>(
  ...inputs: [...ObservableInputTuple<O>, (...value: [T, ...O]) => R]
): OperatorFunction<T, R>;

/**
 * Combines the source Observable with other Observables to create an Observable
 * whose values are calculated from the latest values of each, only when the
 * source emits.
 *
 * <span class="informal">Whenever the source Observable emits a value, it
 * computes a formula using that value plus the latest values from other input
 * Observables, then emits the output of that formula.</span>
 *
 * ![](withLatestFrom.png)
 *
 * `withLatestFrom` combines each value from the source Observable (the
 * instance) with the latest values from the other input Observables only when
 * the source emits a value, optionally using a `project` function to determine
 * the value to be emitted on the output Observable. All input Observables must
 * emit at least one value before the output Observable will emit a value.
 *
 * ## Example
 *
 * On every click event, emit an array with the latest timer event plus the click event
 *
 * ```ts
 * import { fromEvent, interval, withLatestFrom } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const timer = interval(1000);
 * const result = clicks.pipe(withLatestFrom(timer));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link combineLatest}
 *
 * @param inputs An input Observable to combine with the source Observable. More
 * than one input Observables may be given as argument. If the last parameter is
 * a function, it will be used as a projection function for combining values
 * together. When the function is called, it receives all values in order of the
 * Observables passed, where the first parameter is a value from the source
 * Observable. (e.g.
 * `a.pipe(withLatestFrom(b, c), map(([a1, b1, c1]) => a1 + b1 + c1))`). If this
 * is not passed, arrays will be emitted on the output Observable.
 * @return A function that returns an Observable of projected values from the
 * most recent values from each input Observable, or an array of the most
 * recent values from each input Observable.
 */
export function withLatestFrom<T, R>(...inputs: any[]): OperatorFunction<T, R | any[]> {
  const project = popResultSelector(inputs) as ((...args: any[]) => R) | undefined;

  return operate((source, subscriber) => {
    const len = inputs.length;
    const latestValues = new Array(len);
    let hasValue = inputs.map(() => false);
    let ready = false;

    const markReadyIfAllInputsHaveValue = (inputIndex: number) => {
      if (ready || hasValue[inputIndex]) {
        return;
      }

      hasValue[inputIndex] = true;

      if (hasValue.every(identity)) {
        ready = true;
        hasValue = null!;
      }
    };

    for (let i = 0; i < len; i++) {
      innerFrom(inputs[i]).subscribe(
        createOperatorSubscriber(
          subscriber,
          (value) => {
            latestValues[i] = value;
            markReadyIfAllInputsHaveValue(i);
          },
          noop
        )
      );
    }

    source.subscribe(
      createOperatorSubscriber(subscriber, (value) => {
        if (ready) {
          const values = [value, ...latestValues];
          subscriber.next(project ? project(...values) : values);
        }
      })
    );
  });
}
