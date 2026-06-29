# Generated Operator Index

This index catalogs the readable operator tree by semantic group, tags, and spec coverage. It is generated from the current review grouping and source layout.

Legend:

- `public`: exported by `readable-rxjs/src/operators/index.ts`.
- `internal`: readable helper used by operators but not exported from the public operator barrel.
- `deprecated`: RxJS 7 compatibility API or deprecated signature exists.
- `scheduler`: scheduler or timestamp-provider behavior matters.
- `higher-order`: subscribes to inner observable inputs.
- `stateful`: keeps cross-notification state.
- `teardown`: teardown/finalization behavior is behavior-sensitive.
- `direct spec`: has a focused upstream spec file.
- `related spec`: covered through related specs or the full operator sweep.

## Summary

| Area | Count |
| --- | ---: |
| Public operator/source files | 113 |
| Internal helper/source files | 4 |
| Barrel/export file | 1 |
| Total readable operator files | 118 |

## Group 1: Projection And Simple Selection

Page: [Projection And Simple Selection](./01-projection-selection)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `map.ts` | public, projection, thisArg | direct spec: `map-spec.ts` |
| `mapTo.ts` | public, projection, deprecated | direct spec: `mapTo-spec.ts` |
| `pluck.ts` | public, projection, deprecated | direct spec: `pluck-spec.ts` |
| `filter.ts` | public, selection, thisArg | direct spec: `filter-spec.ts` |
| `partition.ts` | public, selection, deprecated | related spec: `spec/observables/partition-spec.ts` |

## Group 2: Boolean, Empty, And Terminal Selection

Page: [Boolean, Empty, And Terminal Selection](./02-boolean-terminal)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `defaultIfEmpty.ts` | public, terminal, stateful | direct spec: `defaultIfEmpty-spec.ts` |
| `throwIfEmpty.ts` | public, terminal, error | direct spec: `throwIfEmpty-spec.ts` |
| `isEmpty.ts` | public, terminal, early-complete | direct spec: `isEmpty-spec.ts` |
| `every.ts` | public, predicate, early-complete, thisArg | direct spec: `every-spec.ts` |
| `count.ts` | public, accumulation, predicate | direct spec: `count-spec.ts` |
| `first.ts` | public, terminal, predicate, error | direct spec: `first-spec.ts` |
| `last.ts` | public, terminal, predicate, error | direct spec: `last-spec.ts` |
| `find.ts` | public, terminal, predicate, thisArg | direct spec: `find-spec.ts` |
| `findIndex.ts` | public, terminal, predicate, thisArg | direct spec: `findIndex-spec.ts` |
| `elementAt.ts` | public, terminal, index, error | direct spec: `elementAt-spec.ts` |
| `single.ts` | public, terminal, predicate, error | direct spec: `single-spec.ts` |

## Group 3: Accumulation And Collection

Page: [Accumulation And Collection](./03-accumulation-collection)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `reduce.ts` | public, accumulation, terminal | direct spec: `reduce-spec.ts` |
| `scan.ts` | public, accumulation, stateful | direct spec: `scan-spec.ts` |
| `scanInternals.ts` | internal, accumulation, shared-internal | related spec: `scan-spec.ts`, `reduce-spec.ts` |
| `toArray.ts` | public, collection, terminal | direct spec: `toArray-spec.ts` |
| `min.ts` | public, accumulation, comparator | direct spec: `min-spec.ts` |
| `max.ts` | public, accumulation, comparator | direct spec: `max-spec.ts` |
| `pairwise.ts` | public, stateful, tuple | direct spec: `pairwise-spec.ts` |
| `sequenceEqual.ts` | public, comparison, stateful, teardown | direct spec: `sequenceEqual-spec.ts` |

## Group 4: Distinctness And Duplicate Filtering

Page: [Distinctness](./04-distinctness)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `distinct.ts` | public, stateful, notifier | direct spec: `distinct-spec.ts` |
| `distinctUntilChanged.ts` | public, stateful, comparator | direct spec: `distinctUntilChanged-spec.ts` |
| `distinctUntilKeyChanged.ts` | public, comparator, key-selector | direct spec: `distinctUntilKeyChanged-spec.ts` |

## Group 5: Prefix, Suffix, Take, And Skip

Page: [Prefix, Suffix, Take, And Skip](./05-take-skip)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `startWith.ts` | public, prefix, scheduler | direct spec: `startWith-spec.ts` |
| `endWith.ts` | public, suffix, scheduler | direct spec: `endWith-spec.ts` |
| `take.ts` | public, boundary, early-complete | direct spec: `take-spec.ts` |
| `takeLast.ts` | public, boundary, stateful, terminal | direct spec: `takeLast-spec.ts` |
| `takeUntil.ts` | public, notifier, teardown | direct spec: `takeUntil-spec.ts` |
| `takeWhile.ts` | public, predicate, inclusive, early-complete | direct spec: `takeWhile-spec.ts` |
| `skip.ts` | public, boundary | direct spec: `skip-spec.ts` |
| `skipLast.ts` | public, boundary, stateful | direct spec: `skipLast-spec.ts` |
| `skipUntil.ts` | public, notifier, stateful | direct spec: `skipUntil-spec.ts` |
| `skipWhile.ts` | public, predicate, stateful | direct spec: `skipWhile-spec.ts` |

## Group 6: Notification And Side-Effect Operators

Page: [Notification And Side Effects](./06-notification-side-effects)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `materialize.ts` | public, notification | direct spec: `materialize-spec.ts` |
| `dematerialize.ts` | public, notification | direct spec: `dematerialize-spec.ts` |
| `ignoreElements.ts` | public, notification, terminal | direct spec: `ignoreElements-spec.ts` |
| `finalize.ts` | public, teardown | direct spec: `finalize-spec.ts` |
| `tap.ts` | public, side-effect, teardown, deprecated | direct spec: `tap-spec.ts` |

## Group 7: Error, Retry, Repeat, And Timeout

Page: [Error, Retry, Repeat, And Timeout](./07-error-retry-timeout)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `catchError.ts` | public, error, higher-order, sync-sensitive | direct spec: `catchError-spec.ts` |
| `onErrorResumeNextWith.ts` | public, error, deprecated-alias | direct spec: `onErrorResumeNext-spec.ts` |
| `retry.ts` | public, error, resubscribe, sync-sensitive | direct spec: `retry-spec.ts` |
| `retryWhen.ts` | public, error, resubscribe, deprecated, sync-sensitive | direct spec: `retryWhen-spec.ts` |
| `repeat.ts` | public, resubscribe, terminal, scheduler | direct spec: `repeat-spec.ts` |
| `repeatWhen.ts` | public, resubscribe, deprecated, notifier, sync-sensitive | direct spec: `repeatWhen-spec.ts` |
| `timeout.ts` | public, scheduler, error, higher-order | direct spec: `timeout-spec.ts` |
| `timeoutWith.ts` | public, scheduler, deprecated | direct spec: `timeoutWith-spec.ts` |

## Group 8: Time And Rate-Limiting

Page: [Time And Rate Limiting](./08-time-rate-limiting)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `delay.ts` | public, scheduler, time | direct spec: `delay-spec.ts` |
| `delayWhen.ts` | public, notifier, higher-order, deprecated | direct spec: `delayWhen-spec.ts` |
| `debounce.ts` | public, notifier, stateful | direct spec: `debounce-spec.ts` |
| `debounceTime.ts` | public, scheduler, time, stateful | direct spec: `debounceTime-spec.ts` |
| `throttle.ts` | public, notifier, stateful, leading-trailing | direct spec: `throttle-spec.ts` |
| `throttleTime.ts` | public, scheduler, time, leading-trailing | direct spec: `throttleTime-spec.ts` |
| `audit.ts` | public, notifier, stateful | direct spec: `audit-spec.ts` |
| `auditTime.ts` | public, scheduler, time | direct spec: `auditTime-spec.ts` |
| `sample.ts` | public, notifier, stateful | direct spec: `sample-spec.ts` |
| `sampleTime.ts` | public, scheduler, time | direct spec: `sampleTime-spec.ts` |
| `timeInterval.ts` | public, scheduler, timestamp-provider | direct spec: `timeInterval-spec.ts` |
| `timestamp.ts` | public, scheduler, timestamp-provider | direct spec: `timestamp-spec.ts` |

## Group 9: Buffer And Window Families

Page: [Buffer And Window](./09-buffer-window)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `buffer.ts` | public, buffer, notifier, stateful | direct spec: `buffer-spec.ts` |
| `bufferCount.ts` | public, buffer, stateful | direct spec: `bufferCount-spec.ts` |
| `bufferTime.ts` | public, buffer, scheduler, stateful | direct spec: `bufferTime-spec.ts` |
| `bufferToggle.ts` | public, buffer, notifier, higher-order, teardown | direct spec: `bufferToggle-spec.ts` |
| `bufferWhen.ts` | public, buffer, notifier, higher-order, teardown | direct spec: `bufferWhen-spec.ts` |
| `window.ts` | public, window, notifier, subject, teardown | direct spec: `window-spec.ts` |
| `windowCount.ts` | public, window, subject, stateful | direct spec: `windowCount-spec.ts` |
| `windowTime.ts` | public, window, scheduler, subject, teardown | direct spec: `windowTime-spec.ts` |
| `windowToggle.ts` | public, window, notifier, subject, teardown | direct spec: `windowToggle-spec.ts` |
| `windowWhen.ts` | public, window, notifier, subject, teardown | direct spec: `windowWhen-spec.ts` |

## Group 10: Higher-Order Flattening

Page: [Higher-Order Flattening](./10-higher-order-flattening)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `mergeInternals.ts` | internal, higher-order, concurrency, shared-internal | related spec: merge/scan/expand specs |
| `mergeMap.ts` | public, higher-order, concurrency, deprecated | direct spec: `mergeMap-spec.ts` |
| `mergeMapTo.ts` | public, higher-order, deprecated | direct spec: `mergeMapTo-spec.ts` |
| `mergeAll.ts` | public, higher-order, concurrency | direct spec: `mergeAll-spec.ts` |
| `mergeScan.ts` | public, higher-order, accumulation, concurrency | direct spec: `mergeScan-spec.ts` |
| `concatMap.ts` | public, higher-order, ordered, deprecated | direct spec: `concatMap-spec.ts` |
| `concatMapTo.ts` | public, higher-order, ordered, deprecated | direct spec: `concatMapTo-spec.ts` |
| `concatAll.ts` | public, higher-order, ordered | direct spec: `concatAll-spec.ts` |
| `switchMap.ts` | public, higher-order, cancellation, deprecated | direct spec: `switchMap-spec.ts` |
| `switchMapTo.ts` | public, higher-order, cancellation, deprecated | direct spec: `switchMapTo-spec.ts` |
| `switchAll.ts` | public, higher-order, cancellation | direct spec: `switchAll-spec.ts` |
| `switchScan.ts` | public, higher-order, accumulation, cancellation | direct spec: `switchScan-spec.ts` |
| `exhaustMap.ts` | public, higher-order, active-inner, deprecated | direct spec: `exhaustMap-spec.ts` |
| `exhaust.ts` | public, higher-order, active-inner, deprecated | related spec: `exhaustAll-spec.ts`, full sweep |
| `exhaustAll.ts` | public, higher-order, active-inner | direct spec: `exhaustAll-spec.ts` |
| `expand.ts` | public, higher-order, recursion, scheduler | direct spec: `expand-spec.ts` |
| `flatMap.ts` | public, higher-order, deprecated-alias | related spec: `mergeMap-spec.ts`, full sweep |

## Group 11: Combination, Join, Race, And Zip

Page: [Combination And Join](./11-combination-join)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `combineLatest.ts` | public, combination, deprecated | direct spec: `combineLatest-spec.ts`, `combineLatest-legacy-spec.ts` |
| `combineLatestAll.ts` | public, higher-order, combination | direct spec: `combineLatestAll-spec.ts` |
| `combineLatestWith.ts` | public, combination | direct spec: `combineLatestWith-spec.ts` |
| `combineAll.ts` | public, higher-order, deprecated | related spec: `combineLatestAll-spec.ts`, full sweep |
| `withLatestFrom.ts` | public, combination, readiness, stateful | direct spec: `withLatestFrom-spec.ts` |
| `zip.ts` | public, combination, deprecated | direct spec: `zip-spec.ts`, `zip-legacy-spec.ts` |
| `zipAll.ts` | public, higher-order, combination | direct spec: `zipAll-spec.ts` |
| `zipWith.ts` | public, combination | direct spec: `zipWith-spec.ts` |
| `race.ts` | public, race, deprecated | related spec: `race-legacy-spec.ts`, `spec/observables/race-spec.ts` |
| `raceWith.ts` | public, race | direct spec: `raceWith-spec.ts` |
| `joinAllInternals.ts` | internal, combination, shared-internal | related spec: `combineLatestAll-spec.ts`, `zipAll-spec.ts` |
| `concat.ts` | public, combination, deprecated | direct spec: `concat-legacy-spec.ts` |
| `concatWith.ts` | public, combination, ordered | direct spec: `concatWith-spec.ts` |
| `merge.ts` | public, combination, deprecated | direct spec: `merge-legacy-spec.ts` |
| `mergeWith.ts` | public, combination, concurrency | direct spec: `mergeWith-spec.ts` |

## Group 12: Multicasting And Sharing

Page: [Multicasting And Sharing](./12-multicasting-sharing)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `connect.ts` | public, multicasting, subject, higher-order | direct spec: `connect-spec.ts` |
| `multicast.ts` | public, multicasting, deprecated | direct spec: `multicast-spec.ts` |
| `publish.ts` | public, multicasting, deprecated | direct spec: `publish-spec.ts` |
| `publishBehavior.ts` | public, multicasting, deprecated, subject | direct spec: `publishBehavior-spec.ts` |
| `publishLast.ts` | public, multicasting, deprecated, subject | direct spec: `publishLast-spec.ts` |
| `publishReplay.ts` | public, multicasting, deprecated, subject | direct spec: `publishReplay-spec.ts` |
| `refCount.ts` | public, multicasting, teardown, sync-sensitive | direct spec: `refCount-spec.ts` |
| `share.ts` | public, multicasting, teardown, reset | direct spec: `share-spec.ts` |
| `shareReplay.ts` | public, multicasting, replay, reset | direct spec: `shareReplay-spec.ts` |
| `groupBy.ts` | public, grouping, subject, teardown | direct spec: `groupBy-spec.ts` |

## Group 13: Scheduling Boundaries

Page: [Scheduling Boundaries](./13-scheduling-boundaries)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `observeOn.ts` | public, scheduler, notifications | direct spec: `observeOn-spec.ts` |
| `subscribeOn.ts` | public, scheduler, subscription | direct spec: `subscribeOn-spec.ts` |

## Export Surface

| File | Tags | Spec coverage |
| --- | --- | --- |
| `index.ts` | barrel, public-export-surface | direct spec: `index-spec.ts` |

## Internal Helper Files

| File | Used by | Coverage |
| --- | --- | --- |
| `OperatorSubscriber.ts` | Most operator implementations | related coverage through full operator suite |
| `mergeInternals.ts` | `mergeMap`, `mergeScan`, `expand` | related coverage through flattening specs |
| `scanInternals.ts` | `scan`, `reduce`, related accumulation paths | related coverage through accumulation specs |
| `joinAllInternals.ts` | `combineLatestAll`, `zipAll` | related coverage through join specs |

## Broad Verification

Latest semantic review verification:

```text
npm run check:types: passed
npm run test:readable: 4 passing
npm run test:operators: 2267 passing, 3 pending
```
