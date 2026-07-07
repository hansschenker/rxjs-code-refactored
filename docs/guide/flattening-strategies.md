# Flattening Strategies

`mergeMap`, `concatMap`, `switchMap`, and `exhaustMap` all do the same job — project each source value to an inner observable and flatten the results into one output stream — and differ on exactly one policy decision:

> **A new outer value arrives while an inner observable is still active. What happens?**

| Operator | Policy | Concurrency | The new value... |
| --- | --- | --- | --- |
| `mergeMap` | run them all | unbounded (or `concurrent`) | starts a new inner immediately |
| `concatMap` | queue | exactly 1 | waits until the current inner completes |
| `switchMap` | newest wins | 1 | cancels the current inner, then starts |
| `exhaustMap` | first wins | 1 | is dropped; its projector is never called |

The same policies exist in `*MapTo`, `*All`, and `*Scan` variants (`mergeAll` is `mergeMap(identity)`, `concatMap` is `mergeMap(project, 1)`, and so on) — read this page against [Group 10](/operators/10-higher-order-flattening), which embeds all seventeen sources.

A marble sketch, with each outer value `a`/`b` projecting to the inner `x-y|` (subscripts mark which outer value an emission came from):

```text
source:     -a-----b-------|
inner(v):    x--y|

mergeMap:   -x₁--y₁x₂--y₂--|      both inners run; output interleaves
concatMap:  -x₁--y₁-x₂--y₂-|      b's inner waits for a's to complete
switchMap:  -x₁--y₁x₂--y₂--|      (same here — a's inner already done when b arrives)
            -a-b-----|
switchMap:  -x₁x₂--y₂|            b cancels a's inner before a's y fires
exhaustMap: -x₁--y₁--|            b is ignored while a's inner is active
```

## The engine: `mergeInternals`

The merge policy is the general case, so it lives in one shared engine, `mergeInternals.ts`, reused verbatim by `mergeMap`, `mergeScan`, and `expand`:

::: details Source — `mergeInternals.ts`
<<< ../../readable-rxjs/src/operators/mergeInternals.ts
:::

The whole engine is four pieces of closure state — `buffer`, `active`, `index`, `isOuterComplete` — and a handful of small functions:

- **Admission** (`startInnerOrBuffer`): if `active < concurrent`, subscribe to the inner now; otherwise push the outer value into `buffer`. With `concurrent = Infinity` the buffer is never used; with `concurrent = 1` this *is* `concatMap`'s queue.
- **Draining** (`drainBuffer`): when an inner completes, `active--` frees a slot and buffered values are shifted out in arrival order. This ordering is behavior-sensitive — the upstream specs pin queue order, and the readable rewrite preserves the exact drain loop.
- **Completion contract** (`completeIfReady`): the output completes only when *all three* are true — the outer completed, the buffer is empty, and no inner is active. Miss any one and you either complete early (dropping queued work) or never complete.
- **Inner completion is deferred to finalization**: the inner's `onComplete` only sets a flag; the `active--`/drain/complete sequence runs in `onFinalize`. That distinction matters because finalization also runs on *unsubscription*, and the `innerComplete` flag ensures a torn-down (not completed) inner doesn't free a slot.
- **Recursion** (`expand`): the `expand` operator sets the flag that feeds every inner value back through `startInnerOrBuffer` — flattening becomes a breadth-limited graph walk, optionally trampolined through a scheduler to avoid unbounded synchronous recursion.

Reentrancy is the reason the state updates look pedantic: an inner subscribed *synchronously* can emit, complete, and trigger `drainBuffer` before `doInnerSub` returns. The engine increments `active` before subscribing and reads `buffer.length` fresh on every loop iteration, so synchronous reentry lands on consistent state.

## The specializations

**`concatMap` and `concatAll`** contain no logic of their own — `concatMap(project)` literally returns `mergeMap(project, 1)`. Read them to see how much behavior one integer buys.

**`switchMap`** doesn't use the engine; its policy is simpler than a queue. It keeps a single inner subscriber reference, and on each outer value unsubscribes the previous inner *before* subscribing the new one. Its completion rule is the two-party version of the contract: complete when the outer has completed *and* no inner is active. Cancellation-on-next is what makes `switchMap` the right default for "latest request wins" UI flows — and what makes it silently drop in-flight work everywhere else.

**`exhaustMap`** inverts switch: while an inner is active, new outer values are discarded — and note from the source that the *projector is never invoked* for a dropped value, so side effects in the projector do not fire. The review log calls this out as a preserved invariant.

## Verifying against the specs

The policies above are not prose claims; they are pinned by the upstream marble suite that runs against these readable sources:

```sh
npm run test:operator -- spec/operators/mergeMap-spec.ts spec/operators/concatMap-spec.ts spec/operators/switchMap-spec.ts spec/operators/exhaustMap-spec.ts spec/operators/expand-spec.ts
```

The full Group 10 run (14 spec files, 354 tests) is recorded in the [semantic review log](/04-semantic-review-log#group-10-higher-order-flattening).

## Where to go next

- [Anatomy Of An Operator](./operator-anatomy) — the `operate`/`OperatorSubscriber` skeleton all of these are built on.
- [Higher-Order Flattening group](/operators/10-higher-order-flattening) — all seventeen sources with cross-links.
- Upstream's user-facing guide to the same topic ships with the sibling checkout (`upstream-rxjs/docs_app/content/guide/higher-order-observables.md`, published at [rxjs.dev](https://rxjs.dev/guide/higher-order-observables)).
