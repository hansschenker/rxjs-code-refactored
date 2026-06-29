# Semantic Operator Review Log

This log records completed semantic review passes over the readable operator tree. It is a study-edition review aid, not upstream RxJS documentation.

## Group 1: Projection And Simple Selection

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/map.ts`
- `readable-rxjs/src/operators/mapTo.ts`
- `readable-rxjs/src/operators/pluck.ts`
- `readable-rxjs/src/operators/filter.ts`
- `readable-rxjs/src/operators/partition.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- `map` preserves `project.call(thisArg, value, index)` behavior and increments the index before emitting the projected value.
- `filter` preserves `predicate.call(thisArg, value, index)` behavior and increments the index for every source value, not only passed values.
- `mapTo` remains a deprecated constant-projection wrapper around `map`.
- `pluck` preserves the runtime empty-property-list error and returns `undefined` as soon as a path segment resolves to `undefined`.
- Operator `partition` preserves tuple order as `[matchingValues, nonMatchingValues]` and delegates both branches through `filter`, including the negated predicate path.

Focused verification:

```sh
npm run test:operator -- spec/operators/map-spec.ts spec/operators/mapTo-spec.ts spec/operators/pluck-spec.ts spec/operators/filter-spec.ts spec/observables/partition-spec.ts
```

Result:

```text
82 passing
```

## Group 2: Boolean, Empty, And Terminal Selection

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/defaultIfEmpty.ts`
- `readable-rxjs/src/operators/throwIfEmpty.ts`
- `readable-rxjs/src/operators/isEmpty.ts`
- `readable-rxjs/src/operators/every.ts`
- `readable-rxjs/src/operators/count.ts`
- `readable-rxjs/src/operators/first.ts`
- `readable-rxjs/src/operators/last.ts`
- `readable-rxjs/src/operators/find.ts`
- `readable-rxjs/src/operators/findIndex.ts`
- `readable-rxjs/src/operators/elementAt.ts`
- `readable-rxjs/src/operators/single.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- `defaultIfEmpty` and `throwIfEmpty` preserve the `hasValue` completion-time branch and only emit the default or construct the error after empty completion.
- `isEmpty` still emits `false` and completes on the first source value, and emits `true` only if the source completes without values.
- `every` preserves predicate `thisArg`, source argument, per-source-value index increment, and early false completion.
- `count` remains a `reduce` wrapper; predicate index handling is delegated through `reduce`.
- `first`, `last`, and `elementAt` preserve the composition order of filter/take/default-or-error operators.
- `find` and `findIndex` share `createFind`, preserving first-match short-circuit behavior and `undefined` or `-1` not-found emissions.
- `single` preserves the distinction between empty source (`EmptyError`), no predicate match (`NotFoundError`), and multiple matches (`SequenceError`).

Focused verification:

```sh
npm run test:operator -- spec/operators/defaultIfEmpty-spec.ts spec/operators/throwIfEmpty-spec.ts spec/operators/isEmpty-spec.ts spec/operators/every-spec.ts spec/operators/count-spec.ts spec/operators/first-spec.ts spec/operators/last-spec.ts spec/operators/find-spec.ts spec/operators/findIndex-spec.ts spec/operators/elementAt-spec.ts spec/operators/single-spec.ts
```

Result:

```text
178 passing
```

## Group 3: Accumulation And Collection

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/reduce.ts`
- `readable-rxjs/src/operators/scan.ts`
- `readable-rxjs/src/operators/scanInternals.ts`
- `readable-rxjs/src/operators/toArray.ts`
- `readable-rxjs/src/operators/min.ts`
- `readable-rxjs/src/operators/max.ts`
- `readable-rxjs/src/operators/pairwise.ts`
- `readable-rxjs/src/operators/sequenceEqual.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- `scanInternals` remains shared by `scan` and related accumulation behavior; seed detection and state release are the main invariants.
- `reduce` preserves completion-time emission and empty-source behavior through the shared scan/reduce state path.
- `min` and `max` remain comparator wrappers and preserve default comparison semantics.
- `pairwise` preserves the first-value buffering rule and emits only after a previous value exists.
- `sequenceEqual` preserves cross-subscription coordination and must wait for both value queues and completion state before deciding equality.

Focused verification:

```sh
npm run test:operator -- spec/operators/reduce-spec.ts spec/operators/scan-spec.ts spec/operators/toArray-spec.ts spec/operators/min-spec.ts spec/operators/max-spec.ts spec/operators/pairwise-spec.ts spec/operators/sequenceEqual-spec.ts
```

Result:

```text
119 passing
```

## Group 4: Distinctness And Duplicate Filtering

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/distinct.ts`
- `readable-rxjs/src/operators/distinctUntilChanged.ts`
- `readable-rxjs/src/operators/distinctUntilKeyChanged.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- `distinct` preserves key storage and flush-notifier clearing behavior.
- `distinctUntilChanged` preserves the default comparator and only updates previous state after the first comparison path allows it.
- `distinctUntilKeyChanged` remains a key-selector wrapper over `distinctUntilChanged`.

Focused verification:

```sh
npm run test:operator -- spec/operators/distinct-spec.ts spec/operators/distinctUntilChanged-spec.ts spec/operators/distinctUntilKeyChanged-spec.ts
```

Result:

```text
67 passing
```

## Group 5: Prefix, Suffix, Take, And Skip

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/startWith.ts`
- `readable-rxjs/src/operators/endWith.ts`
- `readable-rxjs/src/operators/take.ts`
- `readable-rxjs/src/operators/takeLast.ts`
- `readable-rxjs/src/operators/takeUntil.ts`
- `readable-rxjs/src/operators/takeWhile.ts`
- `readable-rxjs/src/operators/skip.ts`
- `readable-rxjs/src/operators/skipLast.ts`
- `readable-rxjs/src/operators/skipUntil.ts`
- `readable-rxjs/src/operators/skipWhile.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- Count boundary behavior is preserved for zero, negative, and finite counts.
- `takeUntil` and `skipUntil` preserve notifier `next` behavior and do not treat notifier completion as a matching signal.
- `takeWhile` preserves inclusive emission behavior.
- `takeLast` and `skipLast` preserve tail buffering and completion-time release or suppression behavior.
- `startWith` and `endWith` preserve scheduler argument handling through the same scheduled concatenation paths.

Focused verification:

```sh
npm run test:operator -- spec/operators/startWith-spec.ts spec/operators/endWith-spec.ts spec/operators/take-spec.ts spec/operators/takeLast-spec.ts spec/operators/takeUntil-spec.ts spec/operators/takeWhile-spec.ts spec/operators/skip-spec.ts spec/operators/skipLast-spec.ts spec/operators/skipUntil-spec.ts spec/operators/skipWhile-spec.ts
```

Result:

```text
178 passing
1 pending
```

## Group 6: Notification And Side-Effect Operators

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/materialize.ts`
- `readable-rxjs/src/operators/dematerialize.ts`
- `readable-rxjs/src/operators/ignoreElements.ts`
- `readable-rxjs/src/operators/finalize.ts`
- `readable-rxjs/src/operators/tap.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- Notification conversion remains one-for-one in `materialize` and `dematerialize`.
- `ignoreElements` still suppresses `next` values while forwarding terminal notifications.
- `finalize` preserves teardown registration rather than notification interception.
- `tap` preserves observer-object and deprecated callback argument compatibility, including subscribe, unsubscribe, and finalize callback timing.

Focused verification:

```sh
npm run test:operator -- spec/operators/materialize-spec.ts spec/operators/dematerialize-spec.ts spec/operators/ignoreElements-spec.ts spec/operators/finalize-spec.ts spec/operators/tap-spec.ts
```

Result:

```text
72 passing
```

## Group 7: Error, Retry, Repeat, And Timeout

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/catchError.ts`
- `readable-rxjs/src/operators/onErrorResumeNextWith.ts`
- `readable-rxjs/src/operators/retry.ts`
- `readable-rxjs/src/operators/retryWhen.ts`
- `readable-rxjs/src/operators/repeat.ts`
- `readable-rxjs/src/operators/repeatWhen.ts`
- `readable-rxjs/src/operators/timeout.ts`
- `readable-rxjs/src/operators/timeoutWith.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- Synchronous error and resubscribe paths remain explicit in `catchError`, `retry`, `retryWhen`, `repeat`, and `repeatWhen`.
- Retry and repeat counters preserve increment timing and reset-on-success behavior.
- Notifier completion behavior remains distinct between retry/repeat configurations and deprecated `retryWhen`/`repeatWhen`.
- `timeout` preserves `TimeoutError` construction timing, `TimeoutInfo` payload shape, source unsubscription before fallback subscription, and scheduler `now()` usage.
- `timeoutWith` remains a deprecated wrapper into `timeout`.

Focused verification:

```sh
npm run test:operator -- spec/operators/catchError-spec.ts spec/operators/onErrorResumeNext-spec.ts spec/operators/retry-spec.ts spec/operators/retryWhen-spec.ts spec/operators/repeat-spec.ts spec/operators/repeatWhen-spec.ts spec/operators/timeout-spec.ts spec/operators/timeoutWith-spec.ts
```

Result:

```text
198 passing
1 pending
```

## Group 8: Time And Rate-Limiting

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/delay.ts`
- `readable-rxjs/src/operators/delayWhen.ts`
- `readable-rxjs/src/operators/debounce.ts`
- `readable-rxjs/src/operators/debounceTime.ts`
- `readable-rxjs/src/operators/throttle.ts`
- `readable-rxjs/src/operators/throttleTime.ts`
- `readable-rxjs/src/operators/audit.ts`
- `readable-rxjs/src/operators/auditTime.ts`
- `readable-rxjs/src/operators/sample.ts`
- `readable-rxjs/src/operators/sampleTime.ts`
- `readable-rxjs/src/operators/timeInterval.ts`
- `readable-rxjs/src/operators/timestamp.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- Scheduler defaults and virtual-time behavior remain covered by focused specs.
- Duration selector operators preserve notifier subscription and teardown timing.
- `throttle` and `throttleTime` preserve leading/trailing configuration behavior.
- `audit`, `debounce`, and `sample` preserve pending-value release rules.
- `timeInterval` and `timestamp` preserve timestamp provider behavior.

Focused verification:

```sh
npm run test:operator -- spec/operators/delay-spec.ts spec/operators/delayWhen-spec.ts spec/operators/debounce-spec.ts spec/operators/debounceTime-spec.ts spec/operators/throttle-spec.ts spec/operators/throttleTime-spec.ts spec/operators/audit-spec.ts spec/operators/auditTime-spec.ts spec/operators/sample-spec.ts spec/operators/sampleTime-spec.ts spec/operators/timeInterval-spec.ts spec/operators/timestamp-spec.ts
```

Result:

```text
217 passing
```

## Group 9: Buffer And Window Families

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/buffer.ts`
- `readable-rxjs/src/operators/bufferCount.ts`
- `readable-rxjs/src/operators/bufferTime.ts`
- `readable-rxjs/src/operators/bufferToggle.ts`
- `readable-rxjs/src/operators/bufferWhen.ts`
- `readable-rxjs/src/operators/window.ts`
- `readable-rxjs/src/operators/windowCount.ts`
- `readable-rxjs/src/operators/windowTime.ts`
- `readable-rxjs/src/operators/windowToggle.ts`
- `readable-rxjs/src/operators/windowWhen.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- Buffer operators preserve array emission timing and completion-time flush behavior.
- Window operators preserve subject notification, completion, error fan-out, and finalization cleanup.
- Time and toggle variants preserve open/close ordering and reentrant mutation protection by iterating over copied active records where needed.
- Closing notifiers remain scoped to their associated buffer/window.

Focused verification:

```sh
npm run test:operator -- spec/operators/buffer-spec.ts spec/operators/bufferCount-spec.ts spec/operators/bufferTime-spec.ts spec/operators/bufferToggle-spec.ts spec/operators/bufferWhen-spec.ts spec/operators/window-spec.ts spec/operators/windowCount-spec.ts spec/operators/windowTime-spec.ts spec/operators/windowToggle-spec.ts spec/operators/windowWhen-spec.ts
```

Result:

```text
171 passing
```

## Group 10: Higher-Order Flattening

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/mergeInternals.ts`
- `readable-rxjs/src/operators/mergeMap.ts`
- `readable-rxjs/src/operators/mergeMapTo.ts`
- `readable-rxjs/src/operators/mergeAll.ts`
- `readable-rxjs/src/operators/mergeScan.ts`
- `readable-rxjs/src/operators/concatMap.ts`
- `readable-rxjs/src/operators/concatMapTo.ts`
- `readable-rxjs/src/operators/concatAll.ts`
- `readable-rxjs/src/operators/switchMap.ts`
- `readable-rxjs/src/operators/switchMapTo.ts`
- `readable-rxjs/src/operators/switchAll.ts`
- `readable-rxjs/src/operators/switchScan.ts`
- `readable-rxjs/src/operators/exhaustMap.ts`
- `readable-rxjs/src/operators/exhaust.ts`
- `readable-rxjs/src/operators/exhaustAll.ts`
- `readable-rxjs/src/operators/expand.ts`
- `readable-rxjs/src/operators/flatMap.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- `mergeInternals` remains the shared concurrency, buffering, and completion engine for `mergeMap`, `mergeScan`, and `expand`.
- `concatMap` and related wrappers preserve concurrency-one behavior.
- `switchMap` preserves previous-inner cancellation and source-completion waiting for the active inner.
- `exhaustMap` preserves active-inner suppression; ignored outer values do not call the projector.
- Deprecated result-selector paths remain present.
- `exhaust.ts` has no direct operator spec in this checkout; behavior is covered through `exhaustAll`, `exhaustMap`, and the full operator sweep.

Focused verification:

```sh
npm run test:operator -- spec/operators/mergeMap-spec.ts spec/operators/mergeMapTo-spec.ts spec/operators/mergeAll-spec.ts spec/operators/mergeScan-spec.ts spec/operators/concatMap-spec.ts spec/operators/concatMapTo-spec.ts spec/operators/concatAll-spec.ts spec/operators/switchMap-spec.ts spec/operators/switchMapTo-spec.ts spec/operators/switchAll-spec.ts spec/operators/switchScan-spec.ts spec/operators/exhaustMap-spec.ts spec/operators/exhaustAll-spec.ts spec/operators/expand-spec.ts
```

Result:

```text
354 passing
```

## Group 11: Combination, Join, Race, And Zip

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/combineLatest.ts`
- `readable-rxjs/src/operators/combineLatestAll.ts`
- `readable-rxjs/src/operators/combineLatestWith.ts`
- `readable-rxjs/src/operators/combineAll.ts`
- `readable-rxjs/src/operators/withLatestFrom.ts`
- `readable-rxjs/src/operators/zip.ts`
- `readable-rxjs/src/operators/zipAll.ts`
- `readable-rxjs/src/operators/zipWith.ts`
- `readable-rxjs/src/operators/race.ts`
- `readable-rxjs/src/operators/raceWith.ts`
- `readable-rxjs/src/operators/joinAllInternals.ts`
- `readable-rxjs/src/operators/concat.ts`
- `readable-rxjs/src/operators/concatWith.ts`
- `readable-rxjs/src/operators/merge.ts`
- `readable-rxjs/src/operators/mergeWith.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- Deprecated wrappers preserve input array/rest handling and result-selector behavior.
- `withLatestFrom` preserves readiness: source emissions are ignored until all other inputs have produced at least one value.
- `joinAllInternals` remains helper coverage through `combineLatestAll` and `zipAll`.
- `race.ts` has no direct operator spec in this checkout; `raceWith`, `race-legacy`, observable `race`, and the full operator sweep cover the behavior.

Focused verification:

```sh
npm run test:operator -- spec/operators/combineLatest-spec.ts spec/operators/combineLatest-legacy-spec.ts spec/operators/combineLatestAll-spec.ts spec/operators/combineLatestWith-spec.ts spec/operators/withLatestFrom-spec.ts spec/operators/zip-spec.ts spec/operators/zip-legacy-spec.ts spec/operators/zipAll-spec.ts spec/operators/zipWith-spec.ts spec/operators/raceWith-spec.ts spec/operators/race-legacy-spec.ts spec/operators/concatWith-spec.ts spec/operators/mergeWith-spec.ts spec/observables/race-spec.ts
```

Result:

```text
300 passing
```

## Group 12: Multicasting And Sharing

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/connect.ts`
- `readable-rxjs/src/operators/multicast.ts`
- `readable-rxjs/src/operators/publish.ts`
- `readable-rxjs/src/operators/publishBehavior.ts`
- `readable-rxjs/src/operators/publishLast.ts`
- `readable-rxjs/src/operators/publishReplay.ts`
- `readable-rxjs/src/operators/refCount.ts`
- `readable-rxjs/src/operators/share.ts`
- `readable-rxjs/src/operators/shareReplay.ts`
- `readable-rxjs/src/operators/groupBy.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- Connector factories preserve creation timing.
- Deprecated multicasting wrappers preserve ConnectableObservable behavior.
- `refCount` preserves synchronous-source connection handling.
- `share` preserves separate reset behavior for error, completion, and ref-count-zero.
- `shareReplay` preserves reset-on-error, no reset-on-complete, and configurable ref-count reset behavior.
- `groupBy` preserves group duration cleanup and active-group source lifetime behavior.

Focused verification:

```sh
npm run test:operator -- spec/operators/connect-spec.ts spec/operators/multicast-spec.ts spec/operators/publish-spec.ts spec/operators/publishBehavior-spec.ts spec/operators/publishLast-spec.ts spec/operators/publishReplay-spec.ts spec/operators/refCount-spec.ts spec/operators/share-spec.ts spec/operators/shareReplay-spec.ts spec/operators/groupBy-spec.ts
```

Result:

```text
317 passing
1 pending
```

## Group 13: Scheduling Boundaries

Date: 2026-06-29

Files reviewed:

- `readable-rxjs/src/operators/observeOn.ts`
- `readable-rxjs/src/operators/subscribeOn.ts`

Review result:

- No behavior issues found.
- No source changes made.

Behavior notes:

- `observeOn` preserves notification scheduling behavior.
- `subscribeOn` preserves subscription scheduling behavior.
- Delay arguments and scheduler defaults remain covered by the focused specs.

Focused verification:

```sh
npm run test:operator -- spec/operators/observeOn-spec.ts spec/operators/subscribeOn-spec.ts
```

Result:

```text
17 passing
```

## Groups 3-13 Broad Verification

Date: 2026-06-29

Commands:

```sh
npm run check:types
npm run test:readable
npm run test:operators
```

Results:

```text
npm run check:types: passed
npm run test:readable: 4 passing
npm run test:operators: 2267 passing, 3 pending
```
