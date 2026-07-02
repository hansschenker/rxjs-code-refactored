import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { innerFrom } from './innerFrom';
import { Subscription } from '../../../upstream-rxjs/src/internal/Subscription';
import { ObservableInput, ObservableInputTuple } from '../../../upstream-rxjs/src/internal/types';
import { argsOrArgArray } from '../../../upstream-rxjs/src/internal/util/argsOrArgArray';
import { createOperatorSubscriber } from '../operators/OperatorSubscriber';
import { Subscriber } from '../../../upstream-rxjs/src/internal/Subscriber';

export function race<T extends readonly unknown[]>(inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;
export function race<T extends readonly unknown[]>(...inputs: [...ObservableInputTuple<T>]): Observable<T[number]>;

/**
 * Returns an observable that mirrors the first source observable to emit an item.
 *
 * ![](race.png)
 *
 * `race` returns an observable, that when subscribed to, subscribes to all source observables immediately.
 * As soon as one of the source observables emits a value, the result unsubscribes from the other sources.
 * The resulting observable will forward all notifications, including error and completion, from the "winning"
 * source observable.
 *
 * If one of the used source observable throws an errors before a first notification
 * the race operator will also throw an error, no matter if another source observable
 * could potentially win the race.
 *
 * `race` can be useful for selecting the response from the fastest network connection for
 * HTTP or WebSockets. `race` can also be useful for switching observable context based on user
 * input.
 *
 * ## Example
 *
 * Subscribes to the observable that was the first to start emitting.
 *
 * ```ts
 * import { interval, map, race } from 'rxjs';
 *
 * const obs1 = interval(7000).pipe(map(() => 'slow one'));
 * const obs2 = interval(3000).pipe(map(() => 'fast one'));
 * const obs3 = interval(5000).pipe(map(() => 'medium one'));
 *
 * race(obs1, obs2, obs3)
 *   .subscribe(winner => console.log(winner));
 *
 * // Outputs
 * // a series of 'fast one'
 * ```
 *
 * @param sources Used to race for which `ObservableInput` emits first.
 * @return An Observable that mirrors the output of the first Observable to emit an item.
 */
export function race<T>(...sources: (ObservableInput<T> | ObservableInput<T>[])[]): Observable<any> {
  sources = argsOrArgArray(sources);
  // If only one source was passed, just return it. Otherwise return the race.
  return sources.length === 1 ? innerFrom(sources[0] as ObservableInput<T>) : new Observable<T>(raceInit(sources as ObservableInput<T>[]));
}

/**
 * An observable initializer function for both the static version and the
 * operator version of race.
 * @param sources The sources to race
 */
export function raceInit<T>(sources: ObservableInput<T>[]) {
  return (subscriber: Subscriber<T>) => {
    // The array of all actively "racing" subscriptions. It is set to `null`
    // as soon as the race has been won.
    let raceSubscriptions: Subscription[] = [];

    // Subscribe to all of the sources. Note that we are checking `raceSubscriptions` in the
    // loop condition: if a racer "wins" synchronously during its own subscription, the array
    // is nulled out and this loop stops before it subscribes to any more sources.
    for (let sourceIndex = 0; raceSubscriptions && !subscriber.closed && sourceIndex < sources.length; sourceIndex++) {
      raceSubscriptions.push(
        innerFrom(sources[sourceIndex] as ObservableInput<T>).subscribe(
          createOperatorSubscriber(subscriber, (value: T) => {
            if (raceSubscriptions) {
              // We're still racing, but we won! So unsubscribe
              // all other subscriptions that we have, except this one.
              for (let i = 0; i < raceSubscriptions.length; i++) {
                if (i !== sourceIndex) {
                  raceSubscriptions[i].unsubscribe();
                }
              }
              raceSubscriptions = null!;
            }
            subscriber.next(value);
          })
        )
      );
    }
  };
}
