import { ObservableInputTuple, OperatorFunction, SchedulerLike } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { concatAll } from './concatAll';
import { popScheduler } from '../../../upstream-rxjs/src/internal/util/args';
import { from } from '../observable/from';

/** @deprecated Replaced with {@link concatWith}. Will be removed in v8. */
export function concat<T, A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): OperatorFunction<T, T | A[number]>;
/** @deprecated Replaced with {@link concatWith}. Will be removed in v8. */
export function concat<T, A extends readonly unknown[]>(
  ...sourcesAndScheduler: [...ObservableInputTuple<A>, SchedulerLike]
): OperatorFunction<T, T | A[number]>;

/**
 * @deprecated Replaced with {@link concatWith}. Will be removed in v8.
 */
export function concat<T, R>(...args: any[]): OperatorFunction<T, R> {
  const scheduler = popScheduler(args);

  return operate((source, subscriber) => {
    const allSources = [source, ...args];
    const scheduledSources = from(allSources, scheduler);

    concatAll()(scheduledSources).subscribe(subscriber);
  });
}
