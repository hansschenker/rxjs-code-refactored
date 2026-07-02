# Virtual Time And Providers

This group covers the `VirtualTimeScheduler` (with its `VirtualAction`) and the seven **identity-preserving re-exports**: the six timing providers plus the `timerHandle` type module. The re-exports are permanent by design, not a rewrite backlog — see below.

Review log: [Scheduler Group 3](/04-semantic-review-log#scheduler-group-3-virtual-time-and-providers)

Focused verification:

```sh
npm run test:operator -- spec/schedulers/VirtualTimeScheduler-spec.ts spec/schedulers/TestScheduler-spec.ts spec/schedulers/animationFrameProvider-spec.ts spec/schedulers/dateTimestampProvider-spec.ts spec/schedulers/intervalProvider-spec.ts spec/schedulers/timeoutProvider-spec.ts
```

## `VirtualTimeScheduler.ts`

Virtual time never uses real timers: `now()` is the current `frame`, and time only advances when `flush()` drains the queue. The file also contains `VirtualAction`.

Behavior-sensitive spots preserved:

- **`flush` drains sorted actions while `delay <= maxFrames`**: a queued `VirtualAction`'s `delay` holds its ABSOLUTE due frame (assigned in `requestAsyncId` as `scheduler.frame + delay`), which is why the frame can jump straight to it and why the loop stops once the next due frame exceeds `maxFrames`. One failed action aborts the whole flush: every remaining action is unsubscribed, then the error is thrown.
- **Reschedule-by-clone**: rescheduling a `VirtualAction` that already ran creates a NEW action and deactivates the old one (`active = false`); the old instance's `_execute` gate then silently skips it. Upstream keeps VirtualActions immutable so tests can inspect them later.
- **Monotonic `index` counter**: each `VirtualAction` takes `scheduler.index += 1`, and `sortActions` orders by due frame first, insertion index second — a stable sort, so actions due on the same frame execute in scheduling order.
- **`recycleAsyncId` is a no-op** (returns `undefined`): virtual actions never arm a real timer, so there is nothing to clear. `requestAsyncId` returns the truthy dummy handle `1` to satisfy `AsyncAction`'s "already scheduled" bookkeeping.
- **`Infinity` delay**: scheduling with a non-finite delay returns `Subscription.EMPTY` — it would never happen, so it is never enqueued.

Note: upstream's `TestScheduler` still extends the **upstream** `VirtualTimeScheduler`; the readable one is exercised by its own spec (`VirtualTimeScheduler-spec.ts`).

::: details Source
<<< ../../readable-rxjs/src/scheduler/VirtualTimeScheduler.ts
:::

## The Seven Identity-Preserving Re-Exports

These files are **permanently** re-exports of the upstream modules:

- `animationFrameProvider.ts`
- `dateTimestampProvider.ts`
- `immediateProvider.ts`
- `intervalProvider.ts`
- `performanceTimestampProvider.ts`
- `timeoutProvider.ts`
- `timerHandle.ts` (type-only module)

### Why the providers are not rewritten

The upstream `TestScheduler`'s `run()` assigns `animationFrameProvider.delegate`, `dateTimestampProvider.delegate`, `immediateProvider.delegate`, `intervalProvider.delegate`, `timeoutProvider.delegate`, and `performanceTimestampProvider.delegate` at the start of **every marble test** and clears them after. That delegation only works on the singleton objects the running code actually imports. If the readable tree had its own copies of the providers, they would be different objects: the TestScheduler would install its virtual-time delegates onto the upstream singletons, the readable scheduler actions would consult their own copies, never see the delegates, and fire **real timers** inside virtual-time tests.

The readable scheduler actions therefore import the providers through re-export modules that preserve upstream object identity. Each re-export file carries an explanatory header comment; `intervalProvider.ts` is included below as the representative example (the other five providers carry the same header). `timerHandle.ts` is a type-only module and is re-exported as-is.

### `intervalProvider.ts` (representative re-export)

::: details Source
<<< ../../readable-rxjs/src/scheduler/intervalProvider.ts
:::

### Spec coverage of the re-exports

`animationFrameProvider-spec.ts`, `dateTimestampProvider-spec.ts`, `intervalProvider-spec.ts`, and `timeoutProvider-spec.ts` run in the scheduler sweep; the runtime path mapping resolves `rxjs/internal/scheduler/*` to the readable directory, so the specs exercise upstream provider code through the re-export modules. `immediateProvider`, `performanceTimestampProvider`, and `timerHandle` have no dedicated spec and are covered through the scheduler and marble-test machinery.
