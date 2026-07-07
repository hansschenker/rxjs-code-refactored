# Higher-Order Flattening

These operators subscribe to inner observable inputs and coordinate concurrency, cancellation, queuing, or recursion. They all answer the same question — *what happens when a new outer value arrives while an inner observable is still active?* — with four different policies: **merge** (run concurrently), **concat** (queue), **switch** (cancel the old), **exhaust** (drop the new). The [Flattening Strategies guide](/guide/flattening-strategies) develops this comparison with marble sketches; this page documents the seventeen files.

The structural map of the group:

- One shared engine, `mergeInternals.ts`, implements the merge policy with a concurrency limit; `mergeMap`, `mergeScan`, and `expand` are thin parameterizations of it, and `concatMap` is `mergeMap` with `concurrent = 1`.
- `switchMap` and `exhaustMap` implement their simpler policies directly.
- Everything else is a wrapper: `*MapTo` fixes the projection to a constant (all deprecated), `*All` flattens an observable-of-observables (`xAll` ≈ `xMap(identity)`), and `flatMap`/`exhaust` are deprecated aliases.

Review log: [Group 10](/04-semantic-review-log#group-10-higher-order-flattening) (354 tests across 14 spec files).

## `mergeInternals.ts`

The concurrency, buffering, and completion engine shared by `mergeMap`, `mergeScan`, and `expand` — the single most important file in this group.

Behavior-sensitive spots preserved:

- **Admission**: a new outer value starts an inner subscription only while `active < concurrent`; otherwise it is buffered in arrival order.
- **Drain order**: when an inner finishes, buffered values are `shift()`ed in FIFO order until the concurrency budget is full again.
- **Completion contract**: the output completes only when the outer has completed *and* the buffer is empty *and* no inner is active.
- **Completion vs. teardown**: an inner's `onComplete` only sets a flag; slot-freeing and draining happen in `onFinalize`, guarded by that flag — so an *unsubscribed* (not completed) inner never frees a slot.
- **Expand recursion**: with `expand = true`, every inner value is emitted *and* fed back through admission, optionally trampolined via `executeSchedule`.

::: details Source
<<< ../../readable-rxjs/src/operators/mergeInternals.ts
:::

## `mergeMap.ts`

The merge policy: every outer value gets an inner subscription, limited by the optional `concurrent` argument (default `Infinity`). The deprecated `resultSelector` overloads are preserved and rewritten as an inner `map` composition — including the arguments contract `(outerValue, innerValue, outerIndex, innerIndex)`.

See also: [`concatMap`](/operators/10-higher-order-flattening#concatmap-ts), [`exhaustMap`](/operators/10-higher-order-flattening#exhaustmap-ts), [`merge`](/observables/04-combination-join#merge-ts), [`mergeAll`](/operators/10-higher-order-flattening#mergeall-ts), [`mergeMapTo`](/operators/10-higher-order-flattening#mergemapto-ts), [`mergeScan`](/operators/10-higher-order-flattening#mergescan-ts), [`switchMap`](/operators/10-higher-order-flattening#switchmap-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/mergeMap.ts
:::

## `mergeMapTo.ts`

Deprecated constant-inner wrapper: `mergeMapTo(inner)` is `mergeMap(() => inner)`. Every outer value re-subscribes the *same* inner observable.

See also: [`concatMapTo`](/operators/10-higher-order-flattening#concatmapto-ts), [`merge`](/observables/04-combination-join#merge-ts), [`mergeAll`](/operators/10-higher-order-flattening#mergeall-ts), [`mergeMap`](/operators/10-higher-order-flattening#mergemap-ts), [`mergeScan`](/operators/10-higher-order-flattening#mergescan-ts), [`switchMapTo`](/operators/10-higher-order-flattening#switchmapto-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/mergeMapTo.ts
:::

## `mergeAll.ts`

Flattens an observable-of-observables with the merge policy: `mergeAll(concurrent)` is `mergeMap(identity, concurrent)`.

See also: [`combineLatestAll`](/operators/11-combination-join#combinelatestall-ts), [`concatAll`](/operators/10-higher-order-flattening#concatall-ts), [`exhaustAll`](/operators/10-higher-order-flattening#exhaustall-ts), [`merge`](/observables/04-combination-join#merge-ts), [`mergeMap`](/operators/10-higher-order-flattening#mergemap-ts), [`mergeMapTo`](/operators/10-higher-order-flattening#mergemapto-ts), [`mergeScan`](/operators/10-higher-order-flattening#mergescan-ts), [`switchAll`](/operators/10-higher-order-flattening#switchall-ts), [`switchMap`](/operators/10-higher-order-flattening#switchmap-ts), [`zipAll`](/operators/11-combination-join#zipall-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/mergeAll.ts
:::

## `mergeScan.ts`

The engine with accumulator state: each inner value updates the running accumulator (via the engine's `onBeforeNext` hook) before being emitted, and the *current* accumulator seeds the next projection. Concurrency above 1 makes accumulator update order dependent on inner timing — preserved exactly as upstream.

See also: [`scan`](/operators/03-accumulation-collection#scan-ts), [`switchScan`](/operators/10-higher-order-flattening#switchscan-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/mergeScan.ts
:::

## `concatMap.ts`

The concat policy is one integer: `concatMap(project)` returns `mergeMap(project, 1)`. Queuing, drain order, and the completion contract all come from the engine.

See also: [`concat`](/observables/04-combination-join#concat-ts), [`concatAll`](/operators/10-higher-order-flattening#concatall-ts), [`concatMapTo`](/operators/10-higher-order-flattening#concatmapto-ts), [`exhaustMap`](/operators/10-higher-order-flattening#exhaustmap-ts), [`mergeMap`](/operators/10-higher-order-flattening#mergemap-ts), [`switchMap`](/operators/10-higher-order-flattening#switchmap-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/concatMap.ts
:::

## `concatMapTo.ts`

Deprecated constant-inner wrapper over `concatMap`.

See also: [`concat`](/observables/04-combination-join#concat-ts), [`concatAll`](/operators/10-higher-order-flattening#concatall-ts), [`concatMap`](/operators/10-higher-order-flattening#concatmap-ts), [`mergeMapTo`](/operators/10-higher-order-flattening#mergemapto-ts), [`switchMapTo`](/operators/10-higher-order-flattening#switchmapto-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/concatMapTo.ts
:::

## `concatAll.ts`

`mergeAll(1)`: flattens an observable-of-observables one inner at a time, buffering the rest.

See also: [`combineLatestAll`](/operators/11-combination-join#combinelatestall-ts), [`concat`](/observables/04-combination-join#concat-ts), [`concatMap`](/operators/10-higher-order-flattening#concatmap-ts), [`concatMapTo`](/operators/10-higher-order-flattening#concatmapto-ts), [`exhaustAll`](/operators/10-higher-order-flattening#exhaustall-ts), [`mergeAll`](/operators/10-higher-order-flattening#mergeall-ts), [`switchAll`](/operators/10-higher-order-flattening#switchall-ts), [`switchMap`](/operators/10-higher-order-flattening#switchmap-ts), [`zipAll`](/operators/11-combination-join#zipall-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/concatAll.ts
:::

## `switchMap.ts`

The switch policy, implemented directly (no engine — a policy of "at most one inner, newest wins" needs no buffer).

Behavior-sensitive spots preserved:

- The previous inner subscriber is unsubscribed **before** the new projection is subscribed.
- Outer completion does not complete the output while an inner is still active; the output completes when the outer has completed *and* no inner is active.
- The deprecated `resultSelector` path is preserved, including inner/outer index bookkeeping.

See also: [`concatMap`](/operators/10-higher-order-flattening#concatmap-ts), [`exhaustMap`](/operators/10-higher-order-flattening#exhaustmap-ts), [`mergeMap`](/operators/10-higher-order-flattening#mergemap-ts), [`switchAll`](/operators/10-higher-order-flattening#switchall-ts), [`switchMapTo`](/operators/10-higher-order-flattening#switchmapto-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/switchMap.ts
:::

## `switchMapTo.ts`

Deprecated constant-inner wrapper over `switchMap`.

See also: [`concatMapTo`](/operators/10-higher-order-flattening#concatmapto-ts), [`switchAll`](/operators/10-higher-order-flattening#switchall-ts), [`switchMap`](/operators/10-higher-order-flattening#switchmap-ts), [`mergeMapTo`](/operators/10-higher-order-flattening#mergemapto-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/switchMapTo.ts
:::

## `switchAll.ts`

`switchMap(identity)`: flattens an observable-of-observables, always following the most recent inner.

See also: [`combineLatestAll`](/operators/11-combination-join#combinelatestall-ts), [`concatAll`](/operators/10-higher-order-flattening#concatall-ts), [`exhaustAll`](/operators/10-higher-order-flattening#exhaustall-ts), [`switchMap`](/operators/10-higher-order-flattening#switchmap-ts), [`switchMapTo`](/operators/10-higher-order-flattening#switchmapto-ts), [`mergeAll`](/operators/10-higher-order-flattening#mergeall-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/switchAll.ts
:::

## `switchScan.ts`

`switchMap` with accumulator state: the projection receives the running accumulator, and each inner value becomes the new accumulator *and* the emission. Switching cancels the in-flight inner, so accumulator updates from a cancelled inner are lost by design.

See also: [`scan`](/operators/03-accumulation-collection#scan-ts), [`mergeScan`](/operators/10-higher-order-flattening#mergescan-ts), [`switchMap`](/operators/10-higher-order-flattening#switchmap-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/switchScan.ts
:::

## `exhaustMap.ts`

The exhaust policy, implemented directly: while an inner is active, new outer values are dropped.

Behavior-sensitive spots preserved:

- The **projector is never called** for a suppressed outer value — side effects in the projection do not fire for dropped values.
- If the outer completed while an inner was active, the inner's completion completes the output.

See also: [`concatMap`](/operators/10-higher-order-flattening#concatmap-ts), [`exhaust`](/operators/10-higher-order-flattening#exhaust-ts), [`mergeMap`](/operators/10-higher-order-flattening#mergemap-ts), [`switchMap`](/operators/10-higher-order-flattening#switchmap-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/exhaustMap.ts
:::

## `exhaust.ts`

Deprecated alias of `exhaustAll`. It has no direct spec in this checkout; behavior is covered through `exhaustAll`, `exhaustMap`, and the full operator sweep (noted in the review log).

::: details Source
<<< ../../readable-rxjs/src/operators/exhaust.ts
:::

## `exhaustAll.ts`

`exhaustMap(identity)`: flattens an observable-of-observables, ignoring new inners while one is active.

See also: [`combineLatestAll`](/operators/11-combination-join#combinelatestall-ts), [`concatAll`](/operators/10-higher-order-flattening#concatall-ts), [`switchAll`](/operators/10-higher-order-flattening#switchall-ts), [`switchMap`](/operators/10-higher-order-flattening#switchmap-ts), [`mergeAll`](/operators/10-higher-order-flattening#mergeall-ts), [`exhaustMap`](/operators/10-higher-order-flattening#exhaustmap-ts), [`zipAll`](/operators/11-combination-join#zipall-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/exhaustAll.ts
:::

## `expand.ts`

Recursive flattening through the engine's `expand` flag: every emission (source or inner) is emitted downstream *and* projected again, breadth-limited by `concurrent`. The optional scheduler trampolines inner subscriptions via `executeSchedule` to keep synchronous recursion bounded — the review log's scheduler-interaction notes apply here.

See also: [`mergeMap`](/operators/10-higher-order-flattening#mergemap-ts), [`mergeScan`](/operators/10-higher-order-flattening#mergescan-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/expand.ts
:::

## `flatMap.ts`

Deprecated alias of `mergeMap`, preserved for API compatibility.

::: details Source
<<< ../../readable-rxjs/src/operators/flatMap.ts
:::
