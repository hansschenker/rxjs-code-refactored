import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { Subscriber } from '../../../upstream-rxjs/src/internal/Subscriber';
import { createOperatorSubscriber } from './OperatorSubscriber';

export function scanInternals<V, A, S>(
  accumulator: (acc: V | A | S, value: V, index: number) => A,
  seed: S,
  hasSeed: boolean,
  emitOnNext: boolean,
  emitBeforeComplete?: undefined | true
) {
  return (source: Observable<V>, subscriber: Subscriber<any>) => {
    let hasState = hasSeed;
    let state: any = seed;
    let index = 0;

    const accumulateValue = (value: V) => {
      const currentIndex = index++;

      state = hasState ? accumulator(state, value, currentIndex) : value;
      hasState = true;

      if (emitOnNext) {
        subscriber.next(state);
      }
    };

    const emitStateBeforeComplete = emitBeforeComplete
      ? () => {
          if (hasState) {
            subscriber.next(state);
          }

          subscriber.complete();
        }
      : undefined;

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        accumulateValue,
        emitStateBeforeComplete
      )
    );
  };
}
