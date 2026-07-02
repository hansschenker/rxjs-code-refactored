# Macro, Micro, And Frame Batching

These schedulers specialize `AsyncAction`/`AsyncScheduler` for three execution timings: microtask-ish "as soon as possible" (`asap`, via `immediateProvider`), synchronous-with-a-queue (`queue`), and browser animation frames (`animationFrame`, via `animationFrameProvider`). Positive delays always fall back to plain `AsyncAction` timer behavior; the interesting code is the zero-delay path.

Review log: [Scheduler Group 2](/04-semantic-review-log#scheduler-group-2-macro-micro-and-frame-batching)

Focused verification:

```sh
npm run test:operator -- spec/schedulers/AsapScheduler-spec.ts spec/schedulers/QueueScheduler-spec.ts spec/schedulers/AnimationFrameScheduler-spec.ts
```

## `AsapAction.ts`

Behavior-sensitive spots preserved:

- **Same-tick batching**: every zero-delay `AsapAction` scheduled during the same synchronous pass shares ONE immediate. The shared handle lives on `scheduler._scheduled` via the `||`-assignment `scheduler._scheduled || (scheduler._scheduled = immediateProvider.setImmediate(...))`; each action also pushes itself onto `scheduler.actions`, and a single flush drains the whole batch.
- **Batch-aware recycling**: `recycleAsyncId` only cancels the shared immediate when the LAST queued action no longer carries the same id (batch-mates share one id and sit contiguously at the tail), and clears `scheduler._scheduled` only when it still equals that id.

::: details Source
<<< ../../readable-rxjs/src/scheduler/AsapAction.ts
:::

## `AsapScheduler.ts`

Behavior-sensitive spots preserved:

- **`flushId` capture**: `flush` reads `this._scheduled` into `flushId` and clears `_scheduled` up front — any action scheduled by work running inside this flush must request a fresh immediate and gets a new id, so the drain loop leaves it queued for the next batch.
- **Batch drain**: the do/while keeps draining only while the head of the queue still carries `flushId`; on error, the remainder of the batch (same id) is unsubscribed before the rethrow.

::: details Source
<<< ../../readable-rxjs/src/scheduler/AsapScheduler.ts
:::

## `asap.ts`

The `asapScheduler` singleton (`new AsapScheduler(AsapAction)`) plus the deprecated `asap` alias.

::: details Source
<<< ../../readable-rxjs/src/scheduler/asap.ts
:::

## `QueueAction.ts`

Behavior-sensitive spots preserved:

- **Synchronous execution for `delay <= 0`**: `schedule` skips the async machinery entirely and calls `scheduler.flush(this)` — if a flush is already running, the `_active` guard queues the action behind the current one; otherwise it executes right there, synchronously. `execute` likewise runs `_execute` directly for zero delay, bypassing the timer-rescheduling bookkeeping.
- **Positive delays** fall back to plain `AsyncAction` behavior in `schedule`, `execute`, and `requestAsyncId`.
- **The documented `0`-return HACK** in `requestAsyncId` is preserved verbatim, including upstream's "instanceo" typo in the comment: `0` is both falsy and a valid `TimerHandle`.

::: details Source
<<< ../../readable-rxjs/src/scheduler/QueueAction.ts
:::

## `QueueScheduler.ts`

An empty subclass by design: the synchronous, queue-on-reentrancy semantics live entirely in `QueueAction`, which calls straight into the inherited `AsyncScheduler.flush`. The subclass exists so queue actions have their own scheduler type to be bound to.

::: details Source
<<< ../../readable-rxjs/src/scheduler/QueueScheduler.ts
:::

## `queue.ts`

The `queueScheduler` singleton (`new QueueScheduler(QueueAction)`) plus the deprecated `queue` alias.

::: details Source
<<< ../../readable-rxjs/src/scheduler/queue.ts
:::

## `AnimationFrameAction.ts`

Behavior-sensitive spots preserved:

- **Same-frame batching**: like `AsapAction`, all zero-delay actions pending before the frame fires share ONE `requestAnimationFrame`, held on `scheduler._scheduled` via the same `||`-assignment.
- **Recycling asymmetry vs `AsapAction`** (7.8.2 behavior): `recycleAsyncId` additionally requires `id === scheduler._scheduled` before cancelling the frame — during a flush `_scheduled` has already moved on, and cancelling then could kill a newly requested frame.

::: details Source
<<< ../../readable-rxjs/src/scheduler/AnimationFrameAction.ts
:::

## `AnimationFrameScheduler.ts`

Behavior-sensitive spots preserved:

- **`flushId` capture differs from `AsapScheduler`**: when an initial action is passed in, `flushId = action.id` and `_scheduled` is left alone — the pending animation frame (if any) must still fire for the actions it was requested for. Only when no action is passed does `flush` read and clear `_scheduled` like `AsapScheduler` does.
- Same batch drain and error-path remainder cleanup as `AsapScheduler`.

::: details Source
<<< ../../readable-rxjs/src/scheduler/AnimationFrameScheduler.ts
:::

## `animationFrame.ts`

The `animationFrameScheduler` singleton (`new AnimationFrameScheduler(AnimationFrameAction)`) plus the deprecated `animationFrame` alias.

::: details Source
<<< ../../readable-rxjs/src/scheduler/animationFrame.ts
:::
