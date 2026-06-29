import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { ObservableInput, OperatorFunction } from '../../../upstream-rxjs/src/internal/types';
import { identity } from '../../../upstream-rxjs/src/internal/util/identity';
import { mapOneOrManyArgs } from '../../../upstream-rxjs/src/internal/util/mapOneOrManyArgs';
import { pipe } from '../../../upstream-rxjs/src/internal/util/pipe';
import { mergeMap } from './mergeMap';
import { toArray } from './toArray';

/**
 * Collects all of the inner sources from source observable. Then, once the
 * source completes, joins the values using the given static.
 *
 * This is used for {@link combineLatestAll} and {@link zipAll} which both have the
 * same behavior of collecting all inner observables, then operating on them.
 *
 * @param joinFn The type of static join to apply to the sources collected
 * @param project The projection function to apply to the values, if any
 */
export function joinAllInternals<T, R>(joinFn: (sources: ObservableInput<T>[]) => Observable<T>, project?: (...args: any[]) => R) {
  const collectSources = toArray() as OperatorFunction<ObservableInput<T>, ObservableInput<T>[]>;
  const joinCollectedSources = mergeMap((sources: ObservableInput<T>[]) => joinFn(sources));
  const projectJoinedValues = project ? mapOneOrManyArgs(project) : (identity as any);

  return pipe(
    collectSources,
    joinCollectedSources,
    projectJoinedValues
  );
}
