# Anatomy Of An Operator

Every one of the 117 operators in the readable tree is built from the same three-part skeleton. This page traces a single value through `map` end-to-end, so that when you open any other operator file you already know where the machinery ends and the operator's own logic begins.

The three parts:

1. **`operate`** — turns an "init" function into a pipeable `OperatorFunction`.
2. **`createOperatorSubscriber`** — wraps the operator's per-notification logic in a `Subscriber` that handles errors, completion, and teardown uniformly.
3. **The operator's own closure state** — whatever the operator needs to remember between notifications (an index, a buffer, an active-inner flag).

## Part 1: `operate` and lifting

An `OperatorFunction<T, R>` is just a function `(source: Observable<T>) => Observable<R>`. That is the whole contract of `.pipe(...)`: each operator receives the observable built so far and returns a new one.

`operate` (upstream `src/internal/util/lift.ts`, quoted here because it is intentionally not part of the readable tree) is the factory almost every operator delegates to:

```ts
export function operate<T, R>(
  init: (liftedSource: Observable<T>, subscriber: Subscriber<R>) => (() => void) | void
): OperatorFunction<T, R> {
  return (source: Observable<T>) => {
    if (hasLift(source)) {
      return source.lift(function (this: Subscriber<R>, liftedSource: Observable<T>) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError('Unable to lift unknown Observable type');
  };
}
```

Three things to internalize:

- **Nothing happens at pipe time.** `map(fn)` only builds an observable that *remembers* the init function. The init runs once per **subscription**, which is why operator state declared inside init (like `map`'s `index`) is naturally per-subscriber.
- **`Observable.subscribe` wires it up.** When the lifted observable is subscribed, it calls the stored init with the original source and the downstream subscriber, and — crucially — `subscriber.add(...)` registers init's return value. That is why an operator can return a function from init and have it run as **extra teardown** when the subscription dies (see `bufferTime` or `share` for real uses).
- **A synchronous throw inside init becomes `subscriber.error(err)`**, not an exception at call time. This is the first layer of the library's "errors travel down the subscriber chain" rule.

## Part 2: `OperatorSubscriber`

Inside init, the operator subscribes to the source — but not with a raw observer. It wraps the downstream subscriber with `createOperatorSubscriber` (readable `src/operators/OperatorSubscriber.ts`):

::: details Source — `OperatorSubscriber.ts`
<<< ../../readable-rxjs/src/operators/OperatorSubscriber.ts
:::

The wrapper gives every operator the same guarantees, so no operator has to reimplement them:

- **Handler errors are routed downstream.** If the operator's `onNext`/`onComplete`/`onError` callback throws, the error is caught and delivered to `destination.error(err)` — the pipeline fails, the process does not.
- **Terminal notifications finalize.** After `onError`/`onComplete` run, the subscriber unsubscribes itself in a `finally` block. Terminal means terminal, even when the handler throws.
- **Unhandled notifications fall through.** Omitting a handler means "forward to the destination unchanged" — which is why `map` only supplies `onNext` and still propagates errors and completion.
- **`onFinalize` runs exactly once on teardown**, and only if the subscriber was not already closed — this is where operators like `switchMap` decrement counters or release inner subscriptions.
- The long comment about V8 **hidden classes** in the constructor is worth reading once: the handlers are assigned in a fixed order so all `OperatorSubscriber` instances share one object shape, keeping property access monomorphic on the library's hottest path.

Because each operator wraps the *downstream* subscriber, a pipe of three operators builds a chain of four subscribers at subscribe time. Values flow down the chain (`source → op1 → op2 → op3 → observer`), and unsubscription tears the same chain from the outside in.

## Part 3: the operator's own logic — `map`

With the machinery understood, `map` is nearly transparent:

::: details Source — `map.ts`
<<< ../../readable-rxjs/src/operators/map.ts
:::

Tracing one value from `clicks.pipe(map(ev => ev.clientX)).subscribe(observer)`:

1. `.subscribe(observer)` subscribes to the lifted observable; `operate`'s wrapper calls `map`'s init with `(clicks, subscriber)` where `subscriber` wraps `observer`.
2. Init declares `index = 0` — fresh for this subscription — and subscribes to `clicks` with an `OperatorSubscriber` whose `onNext` projects the value.
3. A click arrives: `onNext` runs `project.call(thisArg, value, index++)` and calls `subscriber.next(projectedValue)`. If `project` throws, `OperatorSubscriber` catches and routes it to `subscriber.error`.
4. `clicks` completing or erroring falls through the wrapper untouched (no `onComplete`/`onError` supplied) straight to the destination.
5. Unsubscribing the outer subscription closes the chain; `map` holds no resources, so it needs no `onFinalize` and returns no teardown from init.

Everything a more complex operator adds — buffers, timers, inner subscriptions — is layered onto exactly this skeleton. Two recurring subtleties to watch for as you read further:

- **Index/count timing.** State like `index++` must update for *every* source value, not only emitted ones (`filter` increments on non-matches too) — the upstream specs pin this down.
- **Reentrancy.** `subscriber.next(...)` can synchronously cause another source emission (or unsubscription) before it returns. Operators like `take` are written so their state is consistent *before* they call `next` — see the `seen <= count` comparison and its comment in `take.ts`.

## Where to go next

- [Flattening Strategies](./flattening-strategies) — how `mergeMap`, `concatMap`, `switchMap`, and `exhaustMap` differ by one policy decision.
- [Higher-Order Flattening group](/operators/10-higher-order-flattening) — the sources this guide builds on.
- Upstream's conceptual guides ship with the sibling checkout (`upstream-rxjs/docs_app/content/guide/`, also published at [rxjs.dev/guide/operators](https://rxjs.dev/guide/operators)) and cover the user-facing view of the same machinery.
