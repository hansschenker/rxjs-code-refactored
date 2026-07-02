# Multicasting

These files implement the connectable-observable machinery used by the deprecated `multicast`/`publish*` operator family and the newer `connectable` creation function.

Review log: [Observable Group 5](/04-semantic-review-log#observable-group-5-multicasting)

Focused verification:

```sh
npm run test:operator -- spec/observables/connectable-spec.ts spec/operators/multicast-spec.ts spec/operators/publish-spec.ts spec/operators/publishBehavior-spec.ts spec/operators/publishLast-spec.ts spec/operators/publishReplay-spec.ts spec/operators/refCount-spec.ts spec/operators/connect-spec.ts
```

## `ConnectableObservable.ts`

Deprecated in RxJS 7 but still the backbone of the `multicast`/`publish*` operators. The readable rewrite names the connection state machine (`_subject`, `_connection`, `_refCount`) and documents its ordering rules. The readable operator tree imports this same class, so `instanceof ConnectableObservable` assertions in operator specs hold across both trees.

Behavior-sensitive spots preserved:

- `_connection` is assigned **before** `source.subscribe(...)` runs, so a source that tears down synchronously (reentrant) observes the connection it is closing.
- `_teardown()` nulls the connection/subject/ref-count state **before** unsubscribing, preventing reentrant re-teardown.
- On source complete/error, the teardown runs **before** `subject.complete()`/`subject.error()`, so subject handlers observing the connectable see a cold (disconnected) observable.

::: details Source
<<< ../../readable-rxjs/src/observable/ConnectableObservable.ts
:::

## `connectable.ts`

The non-deprecated creation-function replacement for `ConnectableObservable`.

Behavior-sensitive spots preserved:

- The connector subject is created eagerly at call time (not per connection).
- `connect()` reconnects when `!connection || connection.closed`.
- With `resetOnDisconnect`, the subject-resetting teardown is added **after** the source subscription is made.

::: details Source
<<< ../../readable-rxjs/src/observable/connectable.ts
:::
