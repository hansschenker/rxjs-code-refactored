# Observable Review Groups

This document groups the readable observable files for review. The goal is to make the next pass easier to inspect in small semantic batches without losing sight of RxJS compatibility constraints. It is the observable analog of [Operator Review Groups](/02-operator-review-groups).

These files are derived from ReactiveX/RxJS 7.8.x. Treat this as study documentation, not official RxJS guidance.

## Review Rules

- Review behavior, not style alone.
- Preserve public exports, overload order, deprecation signatures, runtime errors, subscription timing, teardown order, and scheduler behavior.
- Prefer upstream specs as the oracle. Add study notes when a branch is subtle, but do not change source behavior to fit the notes.
- When a group touches shared internals (`innerFrom`, `bindCallbackInternals`, `ConnectableObservable`), run dependent operator specs as well as the direct specs.
- Singleton identity matters: `empty()`/`never()` must return the module-level `EMPTY`/`NEVER` instances, and the readable operator tree must import the same instances (`empty-spec` asserts `empty() === EMPTY`; operator specs assert `instanceof ConnectableObservable`).
- The readable root index `readable-rxjs/src/index.ts` mirrors upstream `src/index.ts` export-for-export. Review it for export parity only; it is not counted as one of the 34 rewritten observable files. The same applies to `src/fetch/index.ts` and `src/webSocket/index.ts`.
- `rxjs/ajax` (upstream `src/internal/ajax/`) is out of scope: it is not part of `internal/observable/` and remains upstream code.

## Group 1: Creation Basics

Files:

- `innerFrom.ts`
- `from.ts`
- `of.ts`
- `empty.ts`
- `never.ts`
- `throwError.ts`
- `range.ts`
- `defer.ts`
- `iif.ts`
- `using.ts`

Review focus:

- `innerFrom` type-check priority order (interop observable → array-like → promise → async-iterable → iterable → readable-stream) — the order is semantic.
- Unhandled promise rejection reporting (`fromPromise` trailing `.then(null, reportUnhandledError)`).
- Iterator cleanup on closed subscribers (`fromIterable` early return without `complete`).
- `EMPTY`/`NEVER` singleton identity.
- `throwError` raw-value vs factory error identity and the scheduled subscriber-as-action-state path.
- `range` single-argument swap, non-positive-count short-circuit, exclusive end bound.
- `using` resource creation before factory, falsy result → `EMPTY`, teardown null-guard.

Focused specs:

```sh
npm run test:operator -- spec/observables/from-spec.ts spec/observables/from-promise-spec.ts spec/observables/of-spec.ts spec/observables/empty-spec.ts spec/observables/never-spec.ts spec/observables/throwError-spec.ts spec/observables/range-spec.ts spec/observables/defer-spec.ts spec/observables/if-spec.ts spec/observables/using-spec.ts
```

## Group 2: Timing And Generation

Files:

- `interval.ts`
- `timer.ts`
- `generate.ts`
- `pairs.ts`

Review focus:

- `timer` due-time arithmetic, negative clamping, the `-1` emit-once interval sentinel, and the `function`-not-arrow self-rescheduling callback.
- `generate` `arguments.length` arity dispatch, falsy result-selector defaulting, scheduler vs no-scheduler split.
- Deprecated overload preservation (`generate` positional forms, all four `pairs` overloads).

Focused specs:

```sh
npm run test:operator -- spec/observables/interval-spec.ts spec/observables/timer-spec.ts spec/observables/generate-spec.ts spec/observables/pairs-spec.ts
```

## Group 3: Events And Callbacks

Files:

- `fromEvent.ts`
- `fromEventPattern.ts`
- `bindCallback.ts`
- `bindNodeCallback.ts`
- `bindCallbackInternals.ts`
- `fromSubscribable.ts`

Review focus:

- `fromEvent` duck-typing priority (EventTarget → Node emitter → jQuery-style), both methods required per shape, options forwarded to add and remove, ArrayLike fan-out checked last, multi-argument events emitting the raw args array.
- `bindCallbackInternals` subscriber-before-apply ordering, `isAsync`/`isComplete` synchronous-completion deferral, subscribeOn/observeOn composition, AsyncSubject replay to late subscribers.
- Handler token round-tripping in `fromEventPattern`.

Focused specs:

```sh
npm run test:operator -- spec/observables/fromEvent-spec.ts spec/observables/fromEventPattern-spec.ts spec/observables/bindCallback-spec.ts spec/observables/bindNodeCallback-spec.ts
```

Add `spec/operators/connect-spec.ts` when `fromSubscribable.ts` changes.

## Group 4: Combination And Join

Files:

- `combineLatest.ts`
- `concat.ts`
- `merge.ts`
- `race.ts`
- `zip.ts`
- `forkJoin.ts`
- `onErrorResumeNext.ts`
- `partition.ts`

Review focus:

- `combineLatest` value-recording-before-bookkeeping order, all-sources-emitted gating, per-emission `values.slice()`, scheduler-honoring empty input, `combineLatestInit` export.
- `race` subscription-array nulling before the winning emission, synchronous-winner abort, `raceInit` export.
- `zip` push → every-check → shift+emit → completion-check ordering.
- `forkJoin` completion-before-value logic living in the finalizer.
- `onErrorResumeNext` teardown-after-subscribe registration as the sequencing mechanism.
- `merge`/`concat` argument-mutating `popScheduler`/`popNumber` order and merge's 0/1-source fast paths.
- `partition` using two independent `innerFrom` conversions.

Focused specs:

```sh
npm run test:operator -- spec/observables/combineLatest-spec.ts spec/observables/concat-spec.ts spec/observables/merge-spec.ts spec/observables/race-spec.ts spec/observables/zip-spec.ts spec/observables/forkJoin-spec.ts spec/observables/onErrorResumeNext-spec.ts spec/observables/partition-spec.ts
```

`combineLatestInit` and `raceInit` are also consumed by the operator forms; run `spec/operators/combineLatest-spec.ts`, `spec/operators/combineLatestWith-spec.ts`, and `spec/operators/raceWith-spec.ts` when they change.

## Group 5: Multicasting

Files:

- `ConnectableObservable.ts`
- `connectable.ts`

Review focus:

- `_connection` assignment before `source.subscribe` (reentrant synchronous teardown observes it).
- `_teardown()` nulling state before unsubscribing.
- Teardown before `subject.complete()`/`subject.error()` so handlers see a cold observable.
- `connectable` eager subject creation, reconnect condition `!connection || connection.closed`, resetOnDisconnect teardown added after subscribe.
- Class identity: the readable operator tree must use this `ConnectableObservable` (operator specs assert `instanceof`).

Focused specs:

```sh
npm run test:operator -- spec/observables/connectable-spec.ts spec/operators/multicast-spec.ts spec/operators/publish-spec.ts spec/operators/publishBehavior-spec.ts spec/operators/publishLast-spec.ts spec/operators/publishReplay-spec.ts spec/operators/refCount-spec.ts spec/operators/connect-spec.ts
```

## Group 6: DOM Integration

Files:

- `dom/animationFrames.ts`
- `dom/fetch.ts`
- `dom/webSocket.ts`
- `dom/WebSocketSubject.ts`

Review focus:

- `animationFrames` module-load-time shared default instance, timestamp source selection, requestId reset ordering.
- `fromFetch` `abortable` flipped false before next/complete/error, outer-signal wiring order, per-subscription `{...init, signal}` copy.
- `WebSocketSubject` handler assignment order, `_output` capture before the ctor try/catch, `error()` close-code `TypeError`, socket-matching `onclose` reset, multiplex unsubscribe-message-before-unsubscribe, ReplaySubject-to-socket destination swap with queue replay.

Focused specs:

```sh
npm run test:operator -- spec/observables/dom/animationFrames-spec.ts spec/observables/dom/fetch-spec.ts spec/observables/dom/webSocket-spec.ts
```

Note: on Node ≥ 22 the webSocket "should handle constructor errors if no WebSocketCtor" test fails because Node ships a global `WebSocket`; the failure is identical against unmodified upstream.

## Cross-Group Checks

Run these after any multi-group documentation-informed code review changes:

```sh
npm run check:types
npm run test:readable
npm run test:operators
npm run test:observables
```

If a review changes overloads or public declarations, add the relevant upstream dtslint coverage before accepting the change. Keep readable code within TypeScript 4.2.4 syntax — upstream pins that compiler version.
