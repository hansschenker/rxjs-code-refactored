# Async Core

These files are the foundation of every scheduler: the `Action` base class, the timer-backed `AsyncAction`, the queue-draining `AsyncScheduler`, and the `asyncScheduler` singleton. Every other scheduler in the tree subclasses `AsyncAction`/`AsyncScheduler`, so this group is the highest-risk code in the rewrite: control flow is preserved line-for-line, and readability comes from naming and comments only.

Review log: [Scheduler Group 1](/04-semantic-review-log#scheduler-group-1-async-core)

There is no dedicated spec for the async core; it is exercised by every scheduler spec, all timing operator specs, and the timer/interval observable specs.

Focused verification:

```sh
npm run test:schedulers
npm run test:operator -- spec/observables/timer-spec.ts spec/observables/interval-spec.ts spec/operators/delay-spec.ts spec/operators/debounceTime-spec.ts
```

## `Action.ts`

The abstract base: an `Action` is a `Subscription` with a `schedule(state, delay)` method. The base implementation deliberately ignores its constructor arguments — it only fixes the constructor shape shared by every concrete action — and its `schedule` is a no-op returning `this`.

::: details Source
<<< ../../readable-rxjs/src/scheduler/Action.ts
:::

## `AsyncAction.ts`

One scheduled unit of work backed by a real JS timer via `intervalProvider`. The rewrite documents the lifecycle (`schedule` → timer fires → `execute` → recycle or keep the interval) and the role of the `pending` flag.

Behavior-sensitive spots preserved:

- **Interval recycling**: `recycleAsyncId` KEEPS the running interval when the action is rescheduled from inside its own `work` with the same delay (`delay != null && this.delay === delay && this.pending === false`) — upstream deliberately uses `setInterval` so repeat actions tick at the interval period instead of drifting through serial `setTimeout` calls. Any other combination clears the interval.
- **Errors are returned, not thrown**: `execute` returns an `Error` for a cancelled action and returns (never throws) work errors to `AsyncScheduler.flush`, which owns queue cleanup and the rethrow. On error, `_execute` unsubscribes the action FIRST, then hands the error back.
- **Falsy-error HACK preserved**: a thrown falsy value is replaced with `new Error('Scheduled action threw falsy error')` because callers rely on the truthiness of the return value.
- **Unsubscribe order**: null out `work`/`state`/`scheduler` first, then `arrRemove(actions, this)`, then recycle the timer id (delay `null` never matches `this.delay`, so the interval is always cleared here), then `super.unsubscribe()`.

::: details Source
<<< ../../readable-rxjs/src/scheduler/AsyncAction.ts
:::

## `AsyncScheduler.ts`

The scheduler behind `asyncScheduler`: `flush` is the heart of it.

Behavior-sensitive spots preserved:

- **`_active` reentrancy guard**: if a flush is already draining the queue on this call stack, `flush(action)` just pushes the action onto `actions` and returns — execution stays strictly serial per scheduler.
- **do/while drain**: the loop executes the passed action, then keeps draining via `actions.shift()` until the queue is empty or an action returns a truthy error.
- **Error path**: on error, every remaining queued action is unsubscribed (it will never run) before the error is rethrown to the timer callback.

::: details Source
<<< ../../readable-rxjs/src/scheduler/AsyncScheduler.ts
:::

## `async.ts`

The `asyncScheduler` singleton (`new AsyncScheduler(AsyncAction)`) plus the deprecated `async` alias. The readable root index and the readable operator/observable trees import this instance, so there is a single `asyncScheduler` identity across both trees (it is the default scheduler for the `*Time` operators and for `timer`/`interval`).

::: details Source
<<< ../../readable-rxjs/src/scheduler/async.ts
:::
