# Operator Review Groups

This document groups the readable operator files for review. The goal is to make the next pass easier to inspect in small semantic batches without losing sight of RxJS compatibility constraints.

These files are derived from ReactiveX/RxJS 7.8.x. Treat this as study documentation, not official RxJS guidance.

## Review Rules

- Review behavior, not style alone.
- Preserve public exports, overload order, deprecation signatures, runtime errors, subscription timing, teardown order, and scheduler behavior.
- Prefer upstream specs as the oracle. Add study notes when a branch is subtle, but do not change source behavior to fit the notes.
- When a group touches shared internals, run dependent operator specs as well as the direct specs.
- `index.ts` is the readable operators barrel/export surface. Review it for export parity only; it is not counted as one of the 117 upstream operator implementation files.

## Group 1: Projection And Simple Selection

Files:

- `map.ts`
- `mapTo.ts`
- `pluck.ts`
- `filter.ts`
- `partition.ts`

Review focus:

- Projection and predicate call order.
- Index increment timing.
- `thisArg` behavior where supported.
- Deprecated wrappers (`mapTo`, `pluck`, operator `partition`) preserving public behavior.

Focused specs:

```sh
npm run test:operator -- spec/operators/map-spec.ts spec/operators/mapTo-spec.ts spec/operators/pluck-spec.ts spec/operators/filter-spec.ts spec/observables/partition-spec.ts
```

## Group 2: Boolean, Empty, And Terminal Selection

Files:

- `defaultIfEmpty.ts`
- `throwIfEmpty.ts`
- `isEmpty.ts`
- `every.ts`
- `count.ts`
- `first.ts`
- `last.ts`
- `find.ts`
- `findIndex.ts`
- `elementAt.ts`
- `single.ts`

Review focus:

- Empty-source behavior.
- Predicate errors and index timing.
- Early completion paths.
- Error factory timing and error identity.
- Distinguishing "not found" from valid `undefined` values.

Focused specs:

```sh
npm run test:operator -- spec/operators/defaultIfEmpty-spec.ts spec/operators/throwIfEmpty-spec.ts spec/operators/isEmpty-spec.ts spec/operators/every-spec.ts spec/operators/count-spec.ts spec/operators/first-spec.ts spec/operators/last-spec.ts spec/operators/find-spec.ts spec/operators/findIndex-spec.ts spec/operators/elementAt-spec.ts spec/operators/single-spec.ts
```

## Group 3: Accumulation And Collection

Files:

- `reduce.ts`
- `scan.ts`
- `scanInternals.ts`
- `toArray.ts`
- `min.ts`
- `max.ts`
- `pairwise.ts`
- `sequenceEqual.ts`

Review focus:

- Seed handling.
- Accumulator state release.
- Comparator behavior.
- Pair buffering.
- Cross-subscription comparison and completion coordination in `sequenceEqual`.

Focused specs:

```sh
npm run test:operator -- spec/operators/reduce-spec.ts spec/operators/scan-spec.ts spec/operators/toArray-spec.ts spec/operators/min-spec.ts spec/operators/max-spec.ts spec/operators/pairwise-spec.ts spec/operators/sequenceEqual-spec.ts
```

## Group 4: Distinctness And Duplicate Filtering

Files:

- `distinct.ts`
- `distinctUntilChanged.ts`
- `distinctUntilKeyChanged.ts`

Review focus:

- Key selector timing.
- Comparator defaults.
- Flush notifier behavior in `distinct`.
- Reference equality vs selected-key equality.

Focused specs:

```sh
npm run test:operator -- spec/operators/distinct-spec.ts spec/operators/distinctUntilChanged-spec.ts spec/operators/distinctUntilKeyChanged-spec.ts
```

## Group 5: Prefix, Suffix, Take, And Skip

Files:

- `startWith.ts`
- `endWith.ts`
- `take.ts`
- `takeLast.ts`
- `takeUntil.ts`
- `takeWhile.ts`
- `skip.ts`
- `skipLast.ts`
- `skipUntil.ts`
- `skipWhile.ts`

Review focus:

- Subscription order for notifier-based operators.
- Inclusive `takeWhile` behavior.
- Buffered tail behavior for `takeLast` and `skipLast`.
- Scheduled prefix/suffix behavior.
- Immediate completion and count boundary behavior.

Focused specs:

```sh
npm run test:operator -- spec/operators/startWith-spec.ts spec/operators/endWith-spec.ts spec/operators/take-spec.ts spec/operators/takeLast-spec.ts spec/operators/takeUntil-spec.ts spec/operators/takeWhile-spec.ts spec/operators/skip-spec.ts spec/operators/skipLast-spec.ts spec/operators/skipUntil-spec.ts spec/operators/skipWhile-spec.ts
```

## Group 6: Notification And Side-Effect Operators

Files:

- `materialize.ts`
- `dematerialize.ts`
- `ignoreElements.ts`
- `finalize.ts`
- `tap.ts`

Review focus:

- Notification object shape and ordering.
- `tap` callback argument compatibility.
- `tap` subscribe, unsubscribe, and finalize callback timing.
- `finalize` teardown ordering.
- Terminal notifications forwarded exactly once.

Focused specs:

```sh
npm run test:operator -- spec/operators/materialize-spec.ts spec/operators/dematerialize-spec.ts spec/operators/ignoreElements-spec.ts spec/operators/finalize-spec.ts spec/operators/tap-spec.ts
```

## Group 7: Error, Retry, Repeat, And Timeout

Files:

- `catchError.ts`
- `onErrorResumeNextWith.ts`
- `retry.ts`
- `retryWhen.ts`
- `repeat.ts`
- `repeatWhen.ts`
- `timeout.ts`
- `timeoutWith.ts`

Review focus:

- Synchronous error/resubscribe branches.
- Retrying and repeating count increments.
- Delay notifier completion behavior.
- Deprecated `retryWhen` and `repeatWhen` notifier behavior.
- `TimeoutError` identity, message, and info payload.
- Fallback observable subscription timing in `timeout` and `timeoutWith`.

Focused specs:

```sh
npm run test:operator -- spec/operators/catchError-spec.ts spec/operators/onErrorResumeNext-spec.ts spec/operators/retry-spec.ts spec/operators/retryWhen-spec.ts spec/operators/repeat-spec.ts spec/operators/repeatWhen-spec.ts spec/operators/timeout-spec.ts spec/operators/timeoutWith-spec.ts
```

## Group 8: Time And Rate-Limiting

Files:

- `delay.ts`
- `delayWhen.ts`
- `debounce.ts`
- `debounceTime.ts`
- `throttle.ts`
- `throttleTime.ts`
- `audit.ts`
- `auditTime.ts`
- `sample.ts`
- `sampleTime.ts`
- `timeInterval.ts`
- `timestamp.ts`

Review focus:

- Scheduler defaults.
- Duration/notifier subscription and teardown.
- Leading/trailing throttle semantics.
- Pending value release on completion.
- Timestamp provider and virtual time behavior.

Focused specs:

```sh
npm run test:operator -- spec/operators/delay-spec.ts spec/operators/delayWhen-spec.ts spec/operators/debounce-spec.ts spec/operators/debounceTime-spec.ts spec/operators/throttle-spec.ts spec/operators/throttleTime-spec.ts spec/operators/audit-spec.ts spec/operators/auditTime-spec.ts spec/operators/sample-spec.ts spec/operators/sampleTime-spec.ts spec/operators/timeInterval-spec.ts spec/operators/timestamp-spec.ts
```

## Group 9: Buffer And Window Families

Files:

- `buffer.ts`
- `bufferCount.ts`
- `bufferTime.ts`
- `bufferToggle.ts`
- `bufferWhen.ts`
- `window.ts`
- `windowCount.ts`
- `windowTime.ts`
- `windowToggle.ts`
- `windowWhen.ts`

Review focus:

- Open/close ordering.
- Reentrant mutation protection.
- Completion and error fan-out to active buffers/windows.
- Subject cleanup after unsubscription.
- Scheduled buffer/window creation and closure.

Focused specs:

```sh
npm run test:operator -- spec/operators/buffer-spec.ts spec/operators/bufferCount-spec.ts spec/operators/bufferTime-spec.ts spec/operators/bufferToggle-spec.ts spec/operators/bufferWhen-spec.ts spec/operators/window-spec.ts spec/operators/windowCount-spec.ts spec/operators/windowTime-spec.ts spec/operators/windowToggle-spec.ts spec/operators/windowWhen-spec.ts
```

## Group 10: Higher-Order Flattening

Files:

- `mergeInternals.ts`
- `mergeMap.ts`
- `mergeMapTo.ts`
- `mergeAll.ts`
- `mergeScan.ts`
- `concatMap.ts`
- `concatMapTo.ts`
- `concatAll.ts`
- `switchMap.ts`
- `switchMapTo.ts`
- `switchAll.ts`
- `switchScan.ts`
- `exhaustMap.ts`
- `exhaust.ts`
- `exhaustAll.ts`
- `expand.ts`
- `flatMap.ts`

Review focus:

- Concurrency accounting.
- Buffered outer values.
- Active inner subscription replacement or suppression.
- Result selector deprecated paths.
- Synchronous inner completion and finalization.
- `expand` recursion and optional scheduler path.

Focused specs:

```sh
npm run test:operator -- spec/operators/mergeMap-spec.ts spec/operators/mergeMapTo-spec.ts spec/operators/mergeAll-spec.ts spec/operators/mergeScan-spec.ts spec/operators/concatMap-spec.ts spec/operators/concatMapTo-spec.ts spec/operators/concatAll-spec.ts spec/operators/switchMap-spec.ts spec/operators/switchMapTo-spec.ts spec/operators/switchAll-spec.ts spec/operators/switchScan-spec.ts spec/operators/exhaustMap-spec.ts spec/operators/exhaust-spec.ts spec/operators/exhaustAll-spec.ts spec/operators/expand-spec.ts
```

## Group 11: Combination, Join, Race, And Zip

Files:

- `combineLatest.ts`
- `combineLatestAll.ts`
- `combineLatestWith.ts`
- `combineAll.ts`
- `withLatestFrom.ts`
- `zip.ts`
- `zipAll.ts`
- `zipWith.ts`
- `race.ts`
- `raceWith.ts`
- `joinAllInternals.ts`
- `concat.ts`
- `concatWith.ts`
- `merge.ts`
- `mergeWith.ts`

Review focus:

- Deprecated operator wrappers vs newer `*With` operators.
- Result selector paths.
- Input array vs rest argument handling.
- Readiness rules for `withLatestFrom` and combine-latest behavior.
- First-winner subscription behavior in race.
- Export parity with `index.ts`.

Focused specs:

```sh
npm run test:operator -- spec/operators/combineLatest-spec.ts spec/operators/combineLatest-legacy-spec.ts spec/operators/combineLatestAll-spec.ts spec/operators/combineLatestWith-spec.ts spec/operators/withLatestFrom-spec.ts spec/operators/zip-spec.ts spec/operators/zip-legacy-spec.ts spec/operators/zipAll-spec.ts spec/operators/zipWith-spec.ts spec/operators/race-spec.ts spec/operators/raceWith-spec.ts spec/operators/concatWith-spec.ts spec/operators/mergeWith-spec.ts
```

## Group 12: Multicasting And Sharing

Files:

- `connect.ts`
- `multicast.ts`
- `publish.ts`
- `publishBehavior.ts`
- `publishLast.ts`
- `publishReplay.ts`
- `refCount.ts`
- `share.ts`
- `shareReplay.ts`
- `groupBy.ts`

Review focus:

- Subject connector creation timing.
- Ref counting and synchronous unsubscribe behavior.
- Reset behavior after error, completion, and ref-count-zero.
- Deprecated multicasting compatibility.
- Group lifetime, duration cleanup, and late subscription behavior in `groupBy`.

Focused specs:

```sh
npm run test:operator -- spec/operators/connect-spec.ts spec/operators/multicast-spec.ts spec/operators/publish-spec.ts spec/operators/publishBehavior-spec.ts spec/operators/publishLast-spec.ts spec/operators/publishReplay-spec.ts spec/operators/refCount-spec.ts spec/operators/share-spec.ts spec/operators/shareReplay-spec.ts spec/operators/groupBy-spec.ts
```

## Group 13: Scheduling Boundaries

Files:

- `observeOn.ts`
- `subscribeOn.ts`

Review focus:

- Scheduler defaulting.
- Notification scheduling order.
- Subscription scheduling vs notification scheduling.
- Delay argument handling.

Focused specs:

```sh
npm run test:operator -- spec/operators/observeOn-spec.ts spec/operators/subscribeOn-spec.ts
```

## Cross-Group Checks

Run these after any multi-group documentation-informed code review changes:

```sh
npm run check:types
npm run test:readable
npm run test:operators
```

If a review changes overloads or public declarations, add the relevant upstream dtslint coverage before accepting the change.
