import { SchedulerLike } from '../../../upstream-rxjs/src/internal/types';
import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { EMPTY } from './empty';

export function range(start: number, count?: number): Observable<number>;

/**
 * @deprecated The `scheduler` parameter will be removed in v8. Use `range(start, count).pipe(observeOn(scheduler))` instead. Details: Details: https://rxjs.dev/deprecations/scheduler-argument
 */
export function range(start: number, count: number | undefined, scheduler: SchedulerLike): Observable<number>;

/**
 * Creates an Observable that emits a sequence of numbers within a specified
 * range.
 *
 * <span class="informal">Emits a sequence of numbers in a range.</span>
 *
 * ![](range.png)
 *
 * `range` operator emits a range of sequential integers, in order, where you
 * select the `start` of the range and its `length`. By default, uses no
 * {@link SchedulerLike} and just delivers the notifications synchronously, but may use
 * an optional {@link SchedulerLike} to regulate those deliveries.
 *
 * ## Example
 *
 * Produce a range of numbers
 *
 * ```ts
 * import { range } from 'rxjs';
 *
 * const numbers = range(1, 3);
 *
 * numbers.subscribe({
 *   next: value => console.log(value),
 *   complete: () => console.log('Complete!')
 * });
 *
 * // Logs:
 * // 1
 * // 2
 * // 3
 * // 'Complete!'
 * ```
 *
 * @see {@link timer}
 * @see {@link interval}
 *
 * @param start The value of the first integer in the sequence.
 * @param count The number of sequential integers to generate.
 * @param scheduler A {@link SchedulerLike} to use for scheduling the emissions
 * of the notifications.
 * @return An Observable of numbers that emits a finite range of sequential integers.
 */
export function range(start: number, count?: number, scheduler?: SchedulerLike): Observable<number> {
  if (count == null) {
    // If one argument was passed, it's the count, not the start.
    count = start;
    start = 0;
  }

  if (count <= 0) {
    // No count? We're going nowhere. Return EMPTY.
    return EMPTY;
  }

  // Exclusive upper bound: the first integer that is NOT emitted.
  const end = count + start;

  return new Observable<number>(
    scheduler
      ? // The deprecated scheduled path: one integer per scheduled action,
        // rescheduling itself until the range is exhausted.
        (subscriber) => {
          let nextInteger = start;
          return scheduler.schedule(function () {
            if (nextInteger < end) {
              subscriber.next(nextInteger++);
              this.schedule();
            } else {
              subscriber.complete();
            }
          });
        }
      : // Standard synchronous range. Checking `closed` on each step stops the
        // loop promptly after a synchronous unsubscribe (e.g. `take`).
        (subscriber) => {
          let nextInteger = start;
          while (nextInteger < end && !subscriber.closed) {
            subscriber.next(nextInteger++);
          }
          subscriber.complete();
        }
  );
}
