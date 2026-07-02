# Scheduler Review Groups

This document groups the readable scheduler files for review. The goal is to make the next pass easier to inspect in small semantic batches without losing sight of RxJS compatibility constraints. It is the scheduler analog of [Observable Review Groups](/05-observable-review-groups).

These files are derived from ReactiveX/RxJS 7.8.x. Treat this as study documentation, not official RxJS guidance.

## Review Rules

- Review behavior, not style alone.
- **This is the highest-risk tree in the rewrite.** Scheduler control flow is preserved line-for-line; readability comes from naming and comments only. Every scheduler subclasses `AsyncAction`/`AsyncScheduler`, and reentrancy, timer recycling, and flush batching are trivially easy to break in ways only timing-sensitive specs catch.
- **Provider identity constraint**: the six timing providers (`animationFrameProvider`, `dateTimestampProvider`, `immediateProvider`, `intervalProvider`, `performanceTimestampProvider`, `timeoutProvider`) and the `timerHandle` type module are **permanent identity-preserving re-exports** of upstream. The upstream TestScheduler's `run()` installs virtual-time delegates onto the provider singletons at the start of every marble test; delegation only works on the objects the running code actually imports, so a readable copy would never receive the delegates and would fire real timers in virtual-time tests. Never rewrite these files; review only that the re-export and its explanatory header stay intact.
- Scheduler singleton identity matters: the readable root index exports `asap`/`asapScheduler`, `async`/`asyncScheduler`, `queue`/`queueScheduler`, `animationFrame`/`animationFrameScheduler`, and `VirtualTimeScheduler`/`VirtualAction` from `./scheduler/`, and the readable operator/observable files import their scheduler defaults and providers from readable siblings — a single instance identity across both trees.
- Prefer upstream specs as the oracle. The async core has no dedicated spec; run the full scheduler sweep plus the timing operator specs when it changes.
- Public members accessed across scheduler subclasses must keep their exact declared types; tighten internal-only types only (e.g. `flushId: TimerHandle | undefined` replacing an implicit-any local).
- Keep readable code within TypeScript 4.2.4 syntax — upstream pins that compiler version. In particular, **no `override` keyword** (it is TS 4.3+), even though every action subclass overrides `requestAsyncId`/`recycleAsyncId`.
- The `Scheduler` base class (`src/internal/Scheduler.ts`) is outside the scheduler directory and remains upstream code.

## Group 1: Async Core

Files:

- `Action.ts`
- `AsyncAction.ts`
- `AsyncScheduler.ts`
- `async.ts`

Review focus:

- `AsyncAction.recycleAsyncId` KEEPS the interval when the action is rescheduled from inside its own `work` with the same delay (`pending === false` at that point); anything else clears it.
- `AsyncAction.execute` returns errors instead of throwing, unsubscribes first on error, and preserves the falsy-error HACK (`new Error('Scheduled action threw falsy error')`).
- `AsyncAction.unsubscribe` order: null `work`/`state`/`scheduler` → `arrRemove` → recycle id with delay `null` (always clears) → `super.unsubscribe()`.
- `AsyncScheduler.flush`: `_active` reentrancy guard (queue instead of nested execution), do/while `actions.shift()` drain, error path unsubscribes remaining actions before rethrow.
- `asyncScheduler` singleton identity and the deprecated `async` alias.

Focused specs (no dedicated async-core spec exists):

```sh
npm run test:schedulers
npm run test:operator -- spec/observables/timer-spec.ts spec/observables/interval-spec.ts spec/operators/delay-spec.ts spec/operators/debounceTime-spec.ts
```

## Group 2: Macro, Micro, And Frame Batching

Files:

- `AsapAction.ts`
- `AsapScheduler.ts`
- `asap.ts`
- `QueueAction.ts`
- `QueueScheduler.ts`
- `queue.ts`
- `AnimationFrameAction.ts`
- `AnimationFrameScheduler.ts`
- `animationFrame.ts`

Review focus:

- Same-tick/same-frame batching via the shared `scheduler._scheduled` handle — the `||`-assignment in `requestAsyncId` is the batching mechanism.
- `recycleAsyncId` asymmetry: `AnimationFrameAction` (7.8.2) additionally requires `id === scheduler._scheduled` before cancelling the frame; `AsapAction` clears `_scheduled` conditionally after cancelling the immediate.
- `flushId` capture differs between the two flushes: `AsapScheduler.flush` reads `_scheduled` and clears it up front; `AnimationFrameScheduler.flush` uses `action.id` when an initial action is passed and leaves `_scheduled` alone in that case.
- `QueueAction`: `delay <= 0` executes synchronously through `scheduler.flush(this)` (reentrant work queues via the `_active` guard); `execute` runs `_execute` directly for zero delay; positive delays fall back to `AsyncAction`; the documented `0`-return HACK (including upstream's "instanceo" comment typo) stays verbatim.
- `QueueScheduler` stays an empty subclass; the semantics live in `QueueAction`.

Focused specs:

```sh
npm run test:operator -- spec/schedulers/AsapScheduler-spec.ts spec/schedulers/QueueScheduler-spec.ts spec/schedulers/AnimationFrameScheduler-spec.ts
```

## Group 3: Virtual Time And Providers

Files:

- `VirtualTimeScheduler.ts` (includes `VirtualAction`)
- `animationFrameProvider.ts` (re-export)
- `dateTimestampProvider.ts` (re-export)
- `immediateProvider.ts` (re-export)
- `intervalProvider.ts` (re-export)
- `performanceTimestampProvider.ts` (re-export)
- `timeoutProvider.ts` (re-export)
- `timerHandle.ts` (re-export, type-only)

Review focus:

- `VirtualTimeScheduler.flush` drains sorted actions while `delay <= maxFrames`; a queued action's `delay` is its ABSOLUTE due frame (assigned in `requestAsyncId`), and one failed action cancels everything still queued.
- Rescheduled `VirtualAction`s clone a new action and deactivate the old one (`active` flag gates `_execute`); the monotonic `index` counter makes `sortActions` a stable sort.
- `VirtualAction.recycleAsyncId` is a no-op; `requestAsyncId` returns the truthy dummy handle `1`.
- Re-exports: verify each provider file remains `export * from` the upstream module with its explanatory header — never a copy.

Focused specs:

```sh
npm run test:operator -- spec/schedulers/VirtualTimeScheduler-spec.ts spec/schedulers/TestScheduler-spec.ts spec/schedulers/animationFrameProvider-spec.ts spec/schedulers/dateTimestampProvider-spec.ts spec/schedulers/intervalProvider-spec.ts spec/schedulers/timeoutProvider-spec.ts
```

Note: upstream's `TestScheduler` still extends the **upstream** `VirtualTimeScheduler`; `TestScheduler-spec.ts` exercises that class plus the provider delegation, while the readable `VirtualTimeScheduler` is exercised by its own spec.

## Cross-Group Checks

Run these after any multi-group documentation-informed code review changes:

```sh
npm run check:types
npm run test:readable
npm run test:schedulers
npm run test:operators
npm run test:observables
```

The scheduler sweep must match the upstream-config baseline exactly (120 passing, 0 failing as of 2026-07-02). If a review changes overloads or public declarations, add the relevant upstream dtslint coverage before accepting the change.
