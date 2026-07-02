import { Observable } from '../../../upstream-rxjs/src/internal/Observable';
import { innerFrom } from '../observable/innerFrom';
import { Subject } from '../../../upstream-rxjs/src/internal/Subject';
import { ObservableInput, Observer, OperatorFunction, SubjectLike } from '../../../upstream-rxjs/src/internal/types';
import { operate } from '../../../upstream-rxjs/src/internal/util/lift';
import { createOperatorSubscriber, OperatorSubscriber } from './OperatorSubscriber';

export interface BasicGroupByOptions<K, T> {
  element?: undefined;
  duration?: (grouped: GroupedObservable<K, T>) => ObservableInput<any>;
  connector?: () => SubjectLike<T>;
}

export interface GroupByOptionsWithElement<K, E, T> {
  element: (value: T) => E;
  duration?: (grouped: GroupedObservable<K, E>) => ObservableInput<any>;
  connector?: () => SubjectLike<E>;
}

export function groupBy<T, K>(key: (value: T) => K, options: BasicGroupByOptions<K, T>): OperatorFunction<T, GroupedObservable<K, T>>;

export function groupBy<T, K, E>(
  key: (value: T) => K,
  options: GroupByOptionsWithElement<K, E, T>
): OperatorFunction<T, GroupedObservable<K, E>>;

export function groupBy<T, K extends T>(
  key: (value: T) => value is K
): OperatorFunction<T, GroupedObservable<true, K> | GroupedObservable<false, Exclude<T, K>>>;

export function groupBy<T, K>(key: (value: T) => K): OperatorFunction<T, GroupedObservable<K, T>>;

/**
 * @deprecated use the options parameter instead.
 */
export function groupBy<T, K>(
  key: (value: T) => K,
  element: void,
  duration: (grouped: GroupedObservable<K, T>) => Observable<any>
): OperatorFunction<T, GroupedObservable<K, T>>;

/**
 * @deprecated use the options parameter instead.
 */
export function groupBy<T, K, R>(
  key: (value: T) => K,
  element?: (value: T) => R,
  duration?: (grouped: GroupedObservable<K, R>) => Observable<any>
): OperatorFunction<T, GroupedObservable<K, R>>;

/**
 * Groups the items emitted by an Observable according to a specified criterion,
 * and emits these grouped items as `GroupedObservables`, one
 * {@link GroupedObservable} per group.
 *
 * ![](groupBy.png)
 *
 * When the Observable emits an item, a key is computed for this item with the key function.
 *
 * If a {@link GroupedObservable} for this key exists, this {@link GroupedObservable} emits. Otherwise, a new
 * {@link GroupedObservable} for this key is created and emits.
 *
 * A {@link GroupedObservable} represents values belonging to the same group represented by a common key. The common
 * key is available as the `key` field of a {@link GroupedObservable} instance.
 *
 * The elements emitted by {@link GroupedObservable}s are by default the items emitted by the Observable, or elements
 * returned by the element function.
 *
 * ## Examples
 *
 * Group objects by `id` and return as array
 *
 * ```ts
 * import { of, groupBy, mergeMap, reduce } from 'rxjs';
 *
 * of(
 *   { id: 1, name: 'JavaScript' },
 *   { id: 2, name: 'Parcel' },
 *   { id: 2, name: 'webpack' },
 *   { id: 1, name: 'TypeScript' },
 *   { id: 3, name: 'TSLint' }
 * ).pipe(
 *   groupBy(p => p.id),
 *   mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], [])))
 * )
 * .subscribe(p => console.log(p));
 *
 * // displays:
 * // [{ id: 1, name: 'JavaScript' }, { id: 1, name: 'TypeScript'}]
 * // [{ id: 2, name: 'Parcel' }, { id: 2, name: 'webpack'}]
 * // [{ id: 3, name: 'TSLint' }]
 * ```
 *
 * Pivot data on the `id` field
 *
 * ```ts
 * import { of, groupBy, mergeMap, reduce, map } from 'rxjs';
 *
 * of(
 *   { id: 1, name: 'JavaScript' },
 *   { id: 2, name: 'Parcel' },
 *   { id: 2, name: 'webpack' },
 *   { id: 1, name: 'TypeScript' },
 *   { id: 3, name: 'TSLint' }
 * ).pipe(
 *   groupBy(p => p.id, { element: p => p.name }),
 *   mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], [`${ group$.key }`]))),
 *   map(arr => ({ id: parseInt(arr[0], 10), values: arr.slice(1) }))
 * )
 * .subscribe(p => console.log(p));
 *
 * // displays:
 * // { id: 1, values: [ 'JavaScript', 'TypeScript' ] }
 * // { id: 2, values: [ 'Parcel', 'webpack' ] }
 * // { id: 3, values: [ 'TSLint' ] }
 * ```
 *
 * @param key A function that extracts the key
 * for each item.
 * @param element A function that extracts the
 * return element for each item.
 * @param duration
 * A function that returns an Observable to determine how long each group should
 * exist.
 * @param connector Factory function to create an
 * intermediate Subject through which grouped elements are emitted.
 * @return A function that returns an Observable that emits GroupedObservables,
 * each of which corresponds to a unique key value and each of which emits
 * those items from the source Observable that share that key value.
 *
 * @deprecated Use the options parameter instead.
 */
export function groupBy<T, K, R>(
  key: (value: T) => K,
  element?: (value: T) => R,
  duration?: (grouped: GroupedObservable<K, R>) => Observable<any>,
  connector?: () => Subject<R>
): OperatorFunction<T, GroupedObservable<K, R>>;

// Impl
export function groupBy<T, K, R>(
  keySelector: (value: T) => K,
  elementOrOptions?: ((value: any) => any) | void | BasicGroupByOptions<K, T> | GroupByOptionsWithElement<K, R, T>,
  duration?: (grouped: GroupedObservable<any, any>) => ObservableInput<any>,
  connector?: () => SubjectLike<any>
): OperatorFunction<T, GroupedObservable<K, R>> {
  return operate((source, subscriber) => {
    let element: ((value: any) => any) | void;

    if (!elementOrOptions || typeof elementOrOptions === 'function') {
      element = elementOrOptions as ((value: any) => any);
    } else {
      ({ duration, element, connector } = elementOrOptions);
    }

    const groups = new Map<K, SubjectLike<any>>();
    const notify = (cb: (group: Observer<any>) => void) => {
      groups.forEach(cb);
      cb(subscriber);
    };

    const handleError = (err: any) => notify((consumer) => consumer.error(err));

    let activeGroups = 0;
    let teardownAttempted = false;

    const createGroupSubject = () => connector ? connector() : new Subject<any>();

    const closeGroup = (group: SubjectLike<any>, durationSubscriber: OperatorSubscriber<any>) => {
      group.complete();
      durationSubscriber?.unsubscribe();
    };

    const subscribeToDuration = (key: K, group: SubjectLike<any>, grouped: GroupedObservable<K, any>) => {
      if (!duration) {
        return;
      }

      let durationSubscriber: OperatorSubscriber<any>;
      durationSubscriber = createOperatorSubscriber(
        group as any,
        () => closeGroup(group, durationSubscriber),
        undefined,
        undefined,
        () => groups.delete(key)
      );

      groupBySourceSubscriber.add(innerFrom(duration(grouped)).subscribe(durationSubscriber));
    };

    const getOrCreateGroup = (key: K) => {
      let group = groups.get(key);

      if (!group) {
        group = createGroupSubject();
        groups.set(key, group);

        const grouped = createGroupedObservable(key, group);
        subscriber.next(grouped);
        subscribeToDuration(key, group, grouped);
      }

      return group;
    };

    const emitToGroup = (value: T) => {
      try {
        const key = keySelector(value);
        const group = getOrCreateGroup(key);

        group.next(element ? element(value) : value);
      } catch (err) {
        handleError(err);
      }
    };

    const groupBySourceSubscriber = new OperatorSubscriber(
      subscriber,
      emitToGroup,
      () => notify((consumer) => consumer.complete()),
      handleError,
      () => groups.clear(),
      () => {
        teardownAttempted = true;
        return activeGroups === 0;
      }
    );

    source.subscribe(groupBySourceSubscriber);

    function createGroupedObservable(key: K, groupSubject: SubjectLike<any>) {
      const result: any = new Observable<T>((groupSubscriber) => {
        activeGroups++;
        const innerSub = groupSubject.subscribe(groupSubscriber);

        return () => {
          innerSub.unsubscribe();

          if (--activeGroups === 0 && teardownAttempted) {
            groupBySourceSubscriber.unsubscribe();
          }
        };
      });

      result.key = key;
      return result;
    }
  });
}

/**
 * An observable of values that is the emitted by the result of a {@link groupBy} operator,
 * contains a `key` property for the grouping.
 */
export interface GroupedObservable<K, T> extends Observable<T> {
  /**
   * The key value for the grouped notifications.
   */
  readonly key: K;
}
