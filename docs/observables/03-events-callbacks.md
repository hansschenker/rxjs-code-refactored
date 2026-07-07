# Events And Callbacks

These observables bridge event emitters, event-pattern handler pairs, and Node-style callback APIs into observables.

Review log: [Observable Group 3](/04-semantic-review-log#observable-group-3-events-and-callbacks)

Focused verification:

```sh
npm run test:operator -- spec/observables/fromEvent-spec.ts spec/observables/fromEventPattern-spec.ts spec/observables/bindCallback-spec.ts spec/observables/bindNodeCallback-spec.ts
```

## `fromEvent.ts`

See also: [`bindCallback`](/observables/03-events-callbacks#bindcallback-ts), [`bindNodeCallback`](/observables/03-events-callbacks#bindnodecallback-ts), [`fromEventPattern`](/observables/03-events-callbacks#fromeventpattern-ts).

The readable rewrite names the three target shapes and their duck-typing checks.

Behavior-sensitive spots preserved:

- Duck-typing priority is EventTarget (`addEventListener`/`removeEventListener`) → Node-style emitter (`addListener`/`removeListener`) → jQuery-style (`on`/`off`), and each shape requires **both** methods to be present.
- The options argument is forwarded to both the add and the remove call — required for correct `removeEventListener` matching.
- The ArrayLike fan-out (subscribing to every element via `mergeMap`) is checked last, only after no single-target shape matched.
- Handlers invoked with multiple arguments emit the raw arguments array, single-argument calls emit the value itself.

::: details Source
<<< ../../readable-rxjs/src/observable/fromEvent.ts
:::

## `fromEventPattern.ts`

See also: [`fromEvent`](/observables/03-events-callbacks#fromevent-ts), [`bindCallback`](/observables/03-events-callbacks#bindcallback-ts), [`bindNodeCallback`](/observables/03-events-callbacks#bindnodecallback-ts).

`addHandler` runs per subscription; its return value is passed to `removeHandler` at teardown. The result-selector path maps through the same multi-argument rule as `fromEvent`.

::: details Source
<<< ../../readable-rxjs/src/observable/fromEventPattern.ts
:::

## `bindCallback.ts`

See also: [`bindNodeCallback`](/observables/03-events-callbacks#bindnodecallback-ts), [`from`](/observables/01-creation-basics#from-ts).

A thin deprecated wrapper delegating to `bindCallbackInternals` with `isNodeStyle = false`.

::: details Source
<<< ../../readable-rxjs/src/observable/bindCallback.ts
:::

## `bindNodeCallback.ts`

See also: [`bindCallback`](/observables/03-events-callbacks#bindcallback-ts), [`from`](/observables/01-creation-basics#from-ts).

A thin deprecated wrapper delegating to `bindCallbackInternals` with `isNodeStyle = true`, adding the error-first callback convention.

::: details Source
<<< ../../readable-rxjs/src/observable/bindNodeCallback.ts
:::

## `bindCallbackInternals.ts`

The shared engine behind `bindCallback` and `bindNodeCallback`. The rewrite names the AsyncSubject bookkeeping that upstream keeps implicit.

Behavior-sensitive spots preserved:

- The subscriber is added to the AsyncSubject **before** the one-time `callbackFunc.apply`, so a synchronously firing callback still reaches the first subscriber.
- The `isAsync`/`isComplete` two-flag dance defers `complete` past synchronous callback invocations, matching upstream's ordering.
- The scheduler path composes `subscribeOn(scheduler)` then `observeOn(scheduler)`.
- Results replay to late subscribers through the AsyncSubject — the wrapped function is called at most once per returned observable.

::: details Source
<<< ../../readable-rxjs/src/observable/bindCallbackInternals.ts
:::

## `fromSubscribable.ts`

An internal adapter that subscribes a raw `Subscribable` (typically a Subject) per subscription. No dedicated spec file; covered through the operator `connect` spec.

::: details Source
<<< ../../readable-rxjs/src/observable/fromSubscribable.ts
:::
