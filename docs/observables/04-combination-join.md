# Combination And Join

These observables combine multiple sources by latest values, sequence, first-winner, index pairing, final values, or predicate split.

Review log: [Observable Group 4](/04-semantic-review-log#observable-group-4-combination-and-join)

Focused verification:

```sh
npm run test:operator -- spec/observables/combineLatest-spec.ts spec/observables/concat-spec.ts spec/observables/merge-spec.ts spec/observables/race-spec.ts spec/observables/zip-spec.ts spec/observables/forkJoin-spec.ts spec/observables/onErrorResumeNext-spec.ts spec/observables/partition-spec.ts
```

## `combineLatest.ts`

See also: [`combineLatestAll`](/operators/11-combination-join#combinelatestall-ts), [`merge`](/observables/04-combination-join#merge-ts), [`withLatestFrom`](/operators/11-combination-join#withlatestfrom-ts).

The readable rewrite names the readiness bookkeeping (`remainingFirstValues`, per-source flags) that upstream tracks with counters.

Behavior-sensitive spots preserved:

- Each source value is recorded into the values slot **before** the first-value bookkeeping runs.
- Emission is gated on every source having emitted at least once.
- Every emission sends a `values.slice()` copy, so downstream mutation cannot corrupt state.
- Empty input with a scheduler still honors the scheduler via `from([], scheduler)`.
- `combineLatestInit` stays exported — the operator-form `combineLatest`/`combineLatestWith` reuse it from the readable tree.

::: details Source
<<< ../../readable-rxjs/src/observable/combineLatest.ts
:::

## `concat.ts`

See also: [`concatAll`](/operators/10-higher-order-flattening#concatall-ts), [`concatMap`](/operators/10-higher-order-flattening#concatmap-ts), [`concatMapTo`](/operators/10-higher-order-flattening#concatmapto-ts), [`startWith`](/operators/05-take-skip#startwith-ts), [`endWith`](/operators/05-take-skip#endwith-ts).

`popScheduler` mutates the argument list before `concatAll()(from(sources, scheduler))` — the argument-popping order is load-bearing.

::: details Source
<<< ../../readable-rxjs/src/observable/concat.ts
:::

## `merge.ts`

See also: [`mergeAll`](/operators/10-higher-order-flattening#mergeall-ts), [`mergeMap`](/operators/10-higher-order-flattening#mergemap-ts), [`mergeMapTo`](/operators/10-higher-order-flattening#mergemapto-ts), [`mergeScan`](/operators/10-higher-order-flattening#mergescan-ts).

Behavior-sensitive spots preserved:

- `popNumber`/`popScheduler` mutate the argument list in upstream's order before the sources are read.
- The fast paths remain: zero sources → `EMPTY`, one source → `innerFrom(sources[0])`, otherwise `mergeAll(concurrent)` over the scheduled source list.

::: details Source
<<< ../../readable-rxjs/src/observable/merge.ts
:::

## `race.ts`

Behavior-sensitive spots preserved:

- The subscription array is nulled **before** the winning value is emitted, so reentrant emissions do not re-trigger the win logic.
- A synchronously winning source aborts all remaining subscriptions before they are created.
- `raceInit` stays exported — the operator-form `raceWith` reuses it from the readable tree.

::: details Source
<<< ../../readable-rxjs/src/observable/race.ts
:::

## `zip.ts`

Behavior-sensitive spot preserved: the per-value sequence is push to the source's buffer → every-buffer-nonempty check → shift one value from each buffer and emit → completion check for any completed source with an empty buffer — in exactly that order. The double teardown registration from upstream is also kept.

::: details Source
<<< ../../readable-rxjs/src/observable/zip.ts
:::

## `forkJoin.ts`

See also: [`combineLatest`](/observables/04-combination-join#combinelatest-ts), [`zip`](/observables/04-combination-join#zip-ts).

Behavior-sensitive spot preserved: the "completed without ever emitting" detection lives in the subscriber **finalizer**, not the `complete` handler — this is what makes the empty-source error/complete decision correct under teardown ordering.

::: details Source
<<< ../../readable-rxjs/src/observable/forkJoin.ts
:::

## `onErrorResumeNext.ts`

See also: [`concat`](/observables/04-combination-join#concat-ts), [`catchError`](/operators/07-error-retry-timeout#catcherror-ts).

Behavior-sensitive spot preserved: the subscription to the next source is registered as a teardown of the current one **after** `subscribe` is called — that registration ordering *is* the sequencing mechanism when a source completes synchronously.

::: details Source
<<< ../../readable-rxjs/src/observable/onErrorResumeNext.ts
:::

## `partition.ts`

See also: [`filter`](/operators/01-projection-selection#filter-ts).

Behavior-sensitive spot preserved: the two branches run **independent** `innerFrom` conversions of the source (not a shared one), matching upstream — a cold source is subscribed twice.

::: details Source
<<< ../../readable-rxjs/src/observable/partition.ts
:::
