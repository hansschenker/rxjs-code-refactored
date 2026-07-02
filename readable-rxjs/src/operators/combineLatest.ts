import { combineLatestInit } from '../observable/combineLatest';
import { ObservableInput, ObservableInputTuple, OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { argsOrArgArray } from '../../../upstream-rxjs/src/internal/util/argsOrArgArray';
import { mapOneOrManyArgs } from '../../../upstream-rxjs/src/internal/util/mapOneOrManyArgs';
import { pipe } from '../../../upstream-rxjs/src/internal/util/pipe';
import { popResultSelector } from '../../../upstream-rxjs/src/internal/util/args';

/** @deprecated Replaced with {@link combineLatestWith}. Will be removed in v8. */
export function combineLatest<T, A extends readonly unknown[], R>(
  sources: [...ObservableInputTuple<A>],
  project: (...values: [T, ...A]) => R
): OperatorFunction<T, R>;
/** @deprecated Replaced with {@link combineLatestWith}. Will be removed in v8. */
export function combineLatest<T, A extends readonly unknown[], R>(sources: [...ObservableInputTuple<A>]): OperatorFunction<T, [T, ...A]>;

/** @deprecated Replaced with {@link combineLatestWith}. Will be removed in v8. */
export function combineLatest<T, A extends readonly unknown[], R>(
  ...sourcesAndProject: [...ObservableInputTuple<A>, (...values: [T, ...A]) => R]
): OperatorFunction<T, R>;
/** @deprecated Replaced with {@link combineLatestWith}. Will be removed in v8. */
export function combineLatest<T, A extends readonly unknown[], R>(...sources: [...ObservableInputTuple<A>]): OperatorFunction<T, [T, ...A]>;

/**
 * @deprecated Replaced with {@link combineLatestWith}. Will be removed in v8.
 */
export function combineLatest<T, R>(...args: (ObservableInput<any> | ((...values: any[]) => R))[]): OperatorFunction<T, unknown> {
  const resultSelector = popResultSelector(args);

  if (resultSelector) {
    return pipe(combineLatest(...(args as Array<ObservableInput<any>>)), mapOneOrManyArgs(resultSelector));
  }

  return operate((source, subscriber) => {
    const combinedSources = [source, ...argsOrArgArray(args)];

    combineLatestInit(combinedSources)(subscriber);
  });
}
