# Semantic Review Log

This log records completed semantic review passes over the readable operator and observable trees. It is a study-edition review aid, not upstream RxJS documentation.

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

## Observable Rewrite: Test Harness Correction

Date: 2026-07-02

While wiring the observable rewrite into the test harness, a defect in the previous setup was found and fixed:

- The previous setup passed the readable path-mapping hook via a CLI `--require` flag. Mocha loads CLI requires **before** config-file requires, so upstream's `spec/support/mocha-path-mappings.js` always installed last. Each mapper wraps the previously installed `Module._resolveFilename`, so the last-installed mapper runs first — upstream's mapper won and routed every `rxjs` import back to the upstream tree.
- Consequence: the earlier recorded operator runs (the "2267 passing" results above) exercised **upstream** code, not the readable operators. They validated the harness and the specs, not the rewrite.
- Fix: `readable-rxjs/spec/support/.mocharc.readable.js` fixes the require order in a config file — upstream's mapper first, the readable mapper (`mocha-readable-path-mappings.js`) last, so the readable hook runs first and delegates non-readable paths to upstream's mapper. The runtime remap now covers `rxjs`, `rxjs/operators`, `rxjs/fetch`, `rxjs/webSocket`, and `rxjs/internal/{operators,observable}/*`.
- Three upstream operator tests are excluded via grep+invert in `.mocharc.readable.js` ("should buffer when Promise resolves", "should skip until Promise resolves", "should window when Promise resolves"). They race `interval(3)` against an 8ms real-timer Promise and are flaky under Windows timer granularity; they fail against unmodified upstream too, and their late uncaught assertions abort the whole mocha run. This accounts for the operator count moving from 2267 to 2264.
- The 2026-07-02 numbers below are therefore the first genuine verification of the readable tree — and it passes.

## Observable Group 1: Creation Basics

Date: 2026-07-02

Files reviewed:

- `readable-rxjs/src/observable/innerFrom.ts`
- `readable-rxjs/src/observable/from.ts`
- `readable-rxjs/src/observable/of.ts`
- `readable-rxjs/src/observable/empty.ts`
- `readable-rxjs/src/observable/never.ts`
- `readable-rxjs/src/observable/throwError.ts`
- `readable-rxjs/src/observable/range.ts`
- `readable-rxjs/src/observable/defer.ts`
- `readable-rxjs/src/observable/iif.ts`
- `readable-rxjs/src/observable/using.ts`

Review result:

- Rewrite complete; behavior verified against upstream specs.

Behavior notes:

- `innerFrom` preserves the type-check priority order (interop observable → array-like → promise → async-iterable → iterable → readable-stream); the order is semantic, not stylistic.
- `fromPromise` keeps the trailing `.then(null, reportUnhandledError)` so post-teardown rejections are reported.
- `fromIterable` early-returns on a closed subscriber so the iterator's `return` cleanup runs without emitting `complete`.
- `empty()` and `never()` return the module-level `EMPTY`/`NEVER` singletons; identity is guaranteed (`empty-spec` asserts `empty() === EMPTY`).
- `throwError` preserves raw-value vs factory error identity; the scheduled path passes the subscriber as the scheduler action state (`emitError as any`), matching upstream exactly.
- `range` preserves the `count == null` single-argument swap, the `count <= 0` → `EMPTY` short-circuit, and the exclusive end bound.
- `using` creates the resource before `observableFactory` runs, maps a falsy result to `EMPTY`, and keeps the teardown null-guard (upstream notes optional chaining broke declaration output).

## Observable Group 2: Timing And Generation

Date: 2026-07-02

Files reviewed:

- `readable-rxjs/src/observable/interval.ts`
- `readable-rxjs/src/observable/timer.ts`
- `readable-rxjs/src/observable/generate.ts`
- `readable-rxjs/src/observable/pairs.ts`

Review result:

- Rewrite complete; behavior verified against upstream specs.

Behavior notes:

- `timer` preserves the due-time arithmetic `isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime` with negative clamping, the `intervalDuration = -1` emit-once sentinel, and the self-rescheduling `function` callback (not an arrow) so `this.schedule` targets the action.
- `generate` preserves the `arguments.length === 1` arity check for the config-object form (the entry point cannot be an arrow function), the falsy fourth-argument identity `resultSelector`, and the scheduler vs no-scheduler split via `defer` plus `scheduleIterable`.
- `pairs` remains a deprecated delegate to `from(Object.entries(obj), scheduler)` with all four deprecated overloads.

## Observable Group 3: Events And Callbacks

Date: 2026-07-02

Files reviewed:

- `readable-rxjs/src/observable/fromEvent.ts`
- `readable-rxjs/src/observable/fromEventPattern.ts`
- `readable-rxjs/src/observable/bindCallback.ts`
- `readable-rxjs/src/observable/bindNodeCallback.ts`
- `readable-rxjs/src/observable/bindCallbackInternals.ts`
- `readable-rxjs/src/observable/fromSubscribable.ts`

Review result:

- Rewrite complete; behavior verified against upstream specs.

Behavior notes:

- `fromEvent` preserves duck-typing priority EventTarget → Node-style emitter → jQuery-style, with both methods required per shape; options are forwarded to BOTH add and remove; the ArrayLike fan-out is checked last; multi-argument events emit the raw arguments array.
- `bindCallbackInternals` adds the subscriber to the AsyncSubject BEFORE the one-time `callbackFunc.apply`; the `isAsync`/`isComplete` two-flag dance defers `complete` past synchronous calls; the scheduler path composes `subscribeOn` then `observeOn`; results replay to late subscribers via the AsyncSubject.
- `fromSubscribable` has no dedicated spec; it is covered through the operator `connect-spec.ts`.
- `bindCallbackInternals` is covered through the `bindCallback`/`bindNodeCallback` specs (32 tests).

## Observable Group 4: Combination And Join

Date: 2026-07-02

Files reviewed:

- `readable-rxjs/src/observable/combineLatest.ts`
- `readable-rxjs/src/observable/concat.ts`
- `readable-rxjs/src/observable/merge.ts`
- `readable-rxjs/src/observable/race.ts`
- `readable-rxjs/src/observable/zip.ts`
- `readable-rxjs/src/observable/forkJoin.ts`
- `readable-rxjs/src/observable/onErrorResumeNext.ts`
- `readable-rxjs/src/observable/partition.ts`

Review result:

- Rewrite complete; behavior verified against upstream specs.

Behavior notes:

- `combineLatest` records values before first-value bookkeeping, gates emission on all-sources-emitted, emits a `values.slice()` copy per emission, honors the scheduler for empty input via `from([], scheduler)`, and keeps `combineLatestInit` exported for the operator form.
- `race` nulls the subscription array BEFORE emitting the winning value, aborts remaining subscriptions on a synchronous winner, and keeps `raceInit` exported for `raceWith`.
- `zip` preserves the push → every-check → shift+emit → empty-buffer completion check order and the double teardown registration.
- `forkJoin` keeps the completion-before-value logic in the subscriber finalizer, not the complete handler.
- `onErrorResumeNext` registers the next-source subscription as teardown AFTER subscribe — that ordering is the sequencing mechanism for synchronous completion.
- `merge` and `concat` preserve the argument-mutating `popScheduler`/`popNumber` order; `merge` keeps the 0 → `EMPTY` and 1 → `innerFrom` fast paths.
- `partition` runs two independent `innerFrom` conversions (not shared), matching upstream.

## Observable Group 5: Multicasting

Date: 2026-07-02

Files reviewed:

- `readable-rxjs/src/observable/ConnectableObservable.ts`
- `readable-rxjs/src/observable/connectable.ts`

Review result:

- Rewrite complete; behavior verified against upstream specs.

Behavior notes:

- `ConnectableObservable` assigns `_connection` before `source.subscribe` (a reentrant synchronous teardown then observes it), `_teardown()` nulls state before unsubscribing, and teardown runs before `subject.complete()`/`subject.error()` so handlers see a cold observable.
- The readable operator tree imports this same class, preserving the `instanceof ConnectableObservable` assertions in the multicast/publish operator specs.
- `connectable` creates the subject eagerly at call time, reconnects when `!connection || connection.closed`, and adds the resetOnDisconnect teardown after subscribe.
- `ConnectableObservable` has no dedicated spec; it is covered through the operator multicast/publish/publishBehavior/publishLast/publishReplay/refCount/share/connect specs (253 tests).

## Observable Group 6: DOM Integration

Date: 2026-07-02

Files reviewed:

- `readable-rxjs/src/observable/dom/animationFrames.ts`
- `readable-rxjs/src/observable/dom/fetch.ts`
- `readable-rxjs/src/observable/dom/webSocket.ts`
- `readable-rxjs/src/observable/dom/WebSocketSubject.ts`

Review result:

- Rewrite complete; behavior verified against upstream specs.

Behavior notes:

- `animationFrames` keeps the module-load-time shared default instance, the timestamp source selection (provider vs raw rAF timestamp), and resets `requestId` before requesting the next frame.
- `fromFetch` flips `abortable` to false BEFORE next/complete/error so a synchronous unsubscribe never aborts a delivered body; the outer-signal wiring order and the per-subscription `{...init, signal}` copy are preserved.
- `WebSocketSubject` preserves the onopen/onerror/onclose/onmessage handler assignment order, captures `_output` before the constructor try/catch, requires a close code in `error()` (else `TypeError`), resets on `onclose` only when the socket matches, sends the multiplex unsubscribe message before unsubscribing, and swaps the destination from the ReplaySubject buffer to a socket-writing subscriber with queue replay after `openObserver.next`.
- `rxjs/ajax` (upstream `src/internal/ajax/`) is not part of `internal/observable/` and remains upstream code; its spec still runs.

Typing directive applied throughout the observable rewrite: internal-only types were tightened (named type aliases for callback shapes, explicit generics, removal of internal `as any` where a precise type works, definite-assignment assertions replacing `@ts-ignore` in `WebSocketSubject`), while public declarations stay byte-compatible, limited to TypeScript 4.2.4.

## Observable Rewrite Broad Verification

Date: 2026-07-02 (Node 24.16.0, Windows)

Commands:

```sh
npm run check:types
npm run test:readable
npm run test:operators
npm run test:observables
```

Results:

```text
npm run check:types: passed
npm run test:readable: 4 passing
npm run test:operators: 2264 passing, 3 pending
npm run test:observables: 522 passing, 2 failing
```

The two `test:observables` failures are pre-existing environment failures unrelated to the rewrite; both are identical against unmodified upstream:

1. ajax "should fail if fails to parse response in older IE" asserts a pre-Node-20 V8 JSON error message string (`rxjs/ajax` is upstream code, out of rewrite scope).
2. webSocket "should handle constructor errors if no WebSocketCtor" — Node ≥ 22 ships a global `WebSocket`, so the `ReferenceError` path cannot fire.
