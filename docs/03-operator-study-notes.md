# Operator Study Notes

These notes capture behavior-sensitive details found while reviewing the readable operator pass. They are intentionally targeted: each note should help a reader understand why the code is shaped the way it is, or what must not be changed casually.

This is study documentation for code derived from ReactiveX/RxJS 7.8.x.

## General Operator Shape

Most readable operator files preserve the upstream RxJS pattern:

- Public overloads and deprecation signatures come first.
- The implementation returns an `OperatorFunction` or `MonoTypeOperatorFunction`.
- `operate` is used to wire a source observable to a destination subscriber.
- `createOperatorSubscriber` wraps local `next`, `error`, `complete`, and finalization callbacks.
- Shared utilities such as `innerFrom`, `executeSchedule`, `arrRemove`, `identity`, and `noop` are kept in the same behavioral positions as upstream.

The readable pass should not be interpreted as permission to simplify the subscription graph. In RxJS, the order in which subscriptions are created, added, finalized, and unsubscribed is often observable.

## Index And Export Surface

`src/operators/index.ts` is the barrel for the readable operator tree. Its review goal is export parity with the intended public operator surface.

Important checks:

- Do not export private helpers such as `mergeInternals`, `joinAllInternals`, `scanInternals`, or `OperatorSubscriber` through the public barrel unless upstream public surface does so.
- Keep deprecated operator exports while studying RxJS 7 behavior.
- If a source file is added or removed later, update this barrel intentionally and verify import tests.

## Synchronous Paths Matter

Several operators have explicit paths for synchronous errors, completions, or resubscriptions:

- `catchError`
- `retry`
- `retryWhen`
- `repeat`
- `repeatWhen`
- `refCount`
- `share`
- `groupBy`
- Higher-order operators that subscribe to synchronous inner sources

These paths usually exist so finalizers run in the expected order before a replacement subscription starts. A readable helper name can make the code easier to follow, but collapsing the branch into a direct recursive call can change teardown timing.

Review question:

- If the source emits, errors, completes, or unsubscribes before `subscribe(...)` returns, does the operator still finalize in the same order?

## Result Selectors Are Deprecated But Live

RxJS 7 still supports deprecated result-selector signatures in several operators:

- `mergeMap`
- `mergeMapTo`
- `concatMap`
- `concatMapTo`
- `switchMap`
- `switchMapTo`
- `exhaustMap`
- `combineLatest`
- `zip`
- Some publish/replay compatibility paths

Study note:

- Do not remove these paths in the study edition.
- Do not move overload order casually; TypeScript inference can change even when runtime behavior does not.
- When a result selector tracks an inner index, verify that the index increments only when inner values are emitted.

## Notifier Completion Is Operator-Specific

Notifier behavior varies by operator:

- `takeUntil`: notifier `next` completes the result; notifier completion alone does not.
- `skipUntil`: notifier `next` starts forwarding values; notifier completion alone does not start forwarding.
- `delayWhen`: duration `next` releases a value; duration completion without `next` does not release it in RxJS 7.
- `buffer` and `window`: notifier emissions close or rotate the current collection.
- `retryWhen` and `repeatWhen`: notifier emissions resubscribe; notifier completion can terminate the outer result.

Review question:

- Is the operator reacting to notifier `next`, `complete`, `error`, or some combination? Do not assume consistency across families.

## Higher-Order Flattening

`mergeInternals.ts` is the shared engine for `mergeMap`, `mergeScan`, and `expand`.

Important state:

- `buffer`: outer values waiting for available concurrency.
- `active`: active inner subscriptions.
- `index`: projection index.
- `isOuterComplete`: whether the outer source has completed.

Important behavior:

- Completion requires outer completion, an empty buffer, and zero active inner subscriptions.
- Buffered values drain only after an inner completes normally.
- `expand` re-emits values and recursively feeds them back through the projection path.
- Scheduled inner subscription support exists for deprecated `expand` scheduler behavior.

Review question:

- If an inner completes synchronously, does `active` decrement before the buffer drains and before final completion is checked?

## Switch, Exhaust, Merge, And Concat Differ On Purpose

Flattening operators are easy to make accidentally equivalent:

- `mergeMap`: subscribe to multiple inners up to concurrency.
- `concatMap`: same engine with concurrency `1`.
- `switchMap`: cancel the previous inner before subscribing to the next.
- `exhaustMap`: ignore new outer values while an inner is active.

Study note:

- In `switchMap`, setting the active inner to `null` is both memory cleanup and completion signal.
- In `exhaustMap`, ignoring a value must not increment projection state or call the projector.
- In `concatMap`, queued outer values must preserve order.

## Buffer And Window Families

Buffers emit arrays; windows emit observable subjects. The code shape is similar, but the lifecycle obligations differ.

Important behavior:

- `bufferTime` and `windowTime` copy active record arrays before iterating to protect against reentrant mutation.
- `bufferToggle` and `windowToggle` must add and remove the exact buffer/window associated with a closing notifier.
- `window`, `windowTime`, `windowToggle`, and `windowWhen` must notify active windows on source error and completion.
- Window subjects should be cleaned up so late subscriptions after teardown do not wait silently forever.

Review question:

- Does a close operation remove the record before or after notifying downstream? That order can be observable under reentrancy.

## Multicasting And Sharing

The multicasting group contains some of the most behavior-sensitive operators:

- `connect`
- `multicast`
- `publish`
- `publishBehavior`
- `publishLast`
- `publishReplay`
- `refCount`
- `share`
- `shareReplay`

Study notes:

- Connector factories must run at the same time as upstream.
- `publishBehavior`, `publishLast`, and `publishReplay` preserve deprecated connectable behavior.
- `refCount` has special handling for synchronous sources whose downstream subscribers unsubscribe before connection assignment completes.
- `share` separates reset-on-error, reset-on-complete, and reset-on-ref-count-zero. These are not interchangeable.
- `shareReplay` intentionally resets on error, does not reset on complete, and only resets on ref-count-zero when configured.

Review question:

- Which subject instance will a late subscriber see after error, completion, or ref-count-zero?

## GroupBy Lifetime

`groupBy` has unusual source teardown behavior. Unsubscribing from the outer grouped observable does not always mean the source should disconnect immediately, because active grouped observables may still be subscribed.

Important behavior:

- Groups are stored by key in a `Map`.
- Duration notifiers complete and remove individual groups.
- Errors from key selection, element selection, or source emission must notify all groups and the downstream subscriber.
- Source teardown waits for active group subscriptions in the special `shouldUnsubscribe` path.

Review question:

- If the outer subscription is closed while a group is still active, can the group still receive source values until it unsubscribes?

## Timeout And Time-Based Operators

Time-based operators are scheduler contracts, not just timer wrappers.

Important behavior:

- `timeout` builds a `TimeoutInfo` containing `meta`, `lastValue`, and `seen`.
- `timeout` unsubscribes the original source before subscribing to the fallback observable.
- `timeoutWith` is deprecated but still maps legacy arguments into `timeout`.
- `delay`, `debounceTime`, `throttleTime`, `auditTime`, `sampleTime`, `timeInterval`, and `timestamp` must preserve scheduler defaults and virtual-time compatibility.

Review question:

- Does the operator use the scheduler-provided `now()` where virtual time expects it?

## Error Identity And Factories

Error factories are often intentionally deferred:

- `throwIfEmpty` should not create its error unless the source completes empty.
- `timeout` should create a `TimeoutError` only when the timeout fires.
- `catchError` should pass the caught observable to the selector.
- `retry` should forward the final source error unchanged when retry count is exhausted.

Review question:

- Is an error being constructed earlier than upstream would construct it?

## Recommended Review Order

For human review, use this order:

1. Projection and simple selection.
2. Boolean, empty, and terminal selection.
3. Accumulation and collection.
4. Notification and side-effect operators.
5. Take/skip/prefix/suffix.
6. Error, retry, repeat, and timeout.
7. Time and rate-limiting.
8. Buffer and window families.
9. Higher-order flattening.
10. Combination and join operators.
11. Multicasting and sharing.
12. `groupBy` as its own deep dive if time allows.

That order keeps review momentum high before entering the subscription-heavy files.

## Baseline Checks For A Review-Only Pass

Documentation-only changes do not need runtime tests. If review notes lead to source edits, use the group-specific focused specs from `02-operator-review-groups.md`, then run:

```sh
npm run check:types
npm run test:readable
npm run test:operators
```
