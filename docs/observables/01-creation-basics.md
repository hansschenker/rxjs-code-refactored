# Creation Basics

These observables create sources from values, iterables, promises, factories, and resources, without timers or external event systems.

Review log: [Observable Group 1](/04-semantic-review-log#observable-group-1-creation-basics)

Focused verification:

```sh
npm run test:operator -- spec/observables/from-spec.ts spec/observables/from-promise-spec.ts spec/observables/of-spec.ts spec/observables/empty-spec.ts spec/observables/never-spec.ts spec/observables/throwError-spec.ts spec/observables/range-spec.ts spec/observables/defer-spec.ts spec/observables/if-spec.ts spec/observables/using-spec.ts
```

## `innerFrom.ts`

The readable rewrite names each conversion path (`fromInteropObservable`, `fromArrayLike`, `fromPromise`, `fromAsyncIterable`, `fromIterable`, `fromReadableStreamLike`) and documents that the type-check priority order — interop observable, then array-like, then promise, then async-iterable, then iterable, then readable-stream — is semantic, not stylistic: a value matching several shapes must be converted by the earliest match.

Behavior-sensitive spots preserved:

- `fromPromise` keeps the trailing `.then(null, reportUnhandledError)` so post-teardown promise rejections are reported instead of swallowed.
- `fromIterable` early-returns when the subscriber is already closed, so the iterator's `return` cleanup runs (via `finally`) without emitting `complete`.

::: details Source
<<< ../../readable-rxjs/src/observable/innerFrom.ts
:::

## `from.ts`

A thin public wrapper: with a scheduler it delegates to `scheduled`, without one to `innerFrom`. The scheduler overload remains deprecated.

::: details Source
<<< ../../readable-rxjs/src/observable/from.ts
:::

## `of.ts`

`of` remains argument-popping (`popScheduler`) followed by `from`. The deprecated scheduler overloads are preserved.

::: details Source
<<< ../../readable-rxjs/src/observable/of.ts
:::

## `empty.ts`

Behavior-sensitive spot preserved: `empty()` without a scheduler returns the module-level `EMPTY` singleton — identity is guaranteed, and the upstream spec asserts `empty() === EMPTY`. The readable operator tree imports this same `EMPTY`, so there is a single identity across operators and observables.

::: details Source
<<< ../../readable-rxjs/src/observable/empty.ts
:::

## `never.ts`

Same singleton rule as `empty`: `never()` returns the module-level `NEVER` instance.

::: details Source
<<< ../../readable-rxjs/src/observable/never.ts
:::

## `throwError.ts`

The rewrite separates the raw-value form (deprecated) from the error-factory form while preserving error identity for both.

Behavior-sensitive spot preserved: the scheduled path passes the subscriber itself as the scheduler action state (`emitError as any`), exactly matching upstream's wiring.

::: details Source
<<< ../../readable-rxjs/src/observable/throwError.ts
:::

## `range.ts`

Behavior-sensitive spots preserved:

- The single-argument form (`count == null`) swaps `start` into `count` and starts at `0`.
- `count <= 0` short-circuits to `EMPTY`.
- The end bound is exclusive: emission stops at `start + count - 1`.

::: details Source
<<< ../../readable-rxjs/src/observable/range.ts
:::

## `defer.ts`

The factory is invoked per subscription and its result converted with `innerFrom`. Factory errors propagate to the subscriber through the normal subscribe path.

::: details Source
<<< ../../readable-rxjs/src/observable/defer.ts
:::

## `iif.ts`

A `defer` over the condition; both branch observables are only touched after the condition is evaluated at subscribe time. Tested by `if-spec.ts`.

::: details Source
<<< ../../readable-rxjs/src/observable/iif.ts
:::

## `using.ts`

Behavior-sensitive spots preserved:

- The resource is created before `observableFactory` runs, so factory errors still leave a created resource to tear down.
- A falsy factory result maps to `EMPTY`.
- The teardown keeps an explicit null-guard instead of optional chaining — upstream notes that optional chaining broke TypeScript declaration output.

::: details Source
<<< ../../readable-rxjs/src/observable/using.ts
:::
