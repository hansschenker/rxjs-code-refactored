# Projection And Simple Selection

These operators map, select, or split source values without changing subscription topology: one source subscription, one downstream subscriber, no inner observables, no timers. That makes them the best files to read first — each is the [operator skeleton](/guide/operator-anatomy) plus a few lines of its own logic, and the recurring subtleties of the whole tree (index timing, `thisArg` semantics, deprecated signature preservation) appear here in their simplest form.

Shared traps to watch for in this group:

- **Index timing**: the `index` passed to user callbacks counts *source* emissions since subscription. `filter` increments it for every value, not only the ones that pass — an off-by-one here survives type checking and most casual testing, and only the specs catch it.
- **`thisArg` is API**: the deprecated `project.call(thisArg, ...)`/`predicate.call(thisArg, ...)` paths must be preserved, including their overload signatures.

Review log: [Group 1](/04-semantic-review-log#group-1-projection-and-simple-selection)

Focused verification:

```sh
npm run test:operator -- spec/operators/map-spec.ts spec/operators/mapTo-spec.ts spec/operators/pluck-spec.ts spec/operators/filter-spec.ts spec/observables/partition-spec.ts
```

## `map.ts`

The canonical operator: project each value, emit the projection, forward everything else. The [anatomy guide](/guide/operator-anatomy) traces a full subscription through this file.

Behavior-sensitive spots preserved:

- `project.call(thisArg, value, index)` — the deprecated `thisArg` calling convention is kept.
- The index is incremented for the *current* emission before the projected value is emitted, so a reentrant source sees a consistent count.
- A throwing `project` is routed to `subscriber.error` by `OperatorSubscriber`, not thrown to the caller.

See also: [`mapTo`](/operators/01-projection-selection#mapto-ts), [`pluck`](/operators/01-projection-selection#pluck-ts).

::: details Source

<<< ../../readable-rxjs/src/operators/map.ts

:::

## `mapTo.ts`

Deprecated constant-projection wrapper: `mapTo(x)` is literally `map(() => x)`. It exists as its own file only because the public API surface (and its deprecation notice) must be preserved.

See also: [`map`](/operators/01-projection-selection#map-ts).

::: details Source

<<< ../../readable-rxjs/src/operators/mapTo.ts

:::

## `pluck.ts`

Deprecated path-projection wrapper around `map`. Two runtime behaviors are contract, not accident:

- An empty property list throws a runtime error (`'list of properties cannot be empty.'`) — at call time, not subscribe time.
- Path walking short-circuits: as soon as any segment resolves to `undefined`, the emission is `undefined` rather than a thrown `TypeError`.

See also: [`map`](/operators/01-projection-selection#map-ts).

::: details Source

<<< ../../readable-rxjs/src/operators/pluck.ts

:::

## `filter.ts`

Emits only values for which the predicate returns true. The group's index-timing trap lives here:

- `predicate.call(thisArg, value, index)` — and the index increments for **every** source value, including ones that are filtered out. The predicate for the fifth source emission always receives `4`, regardless of how many passed.

See also: [`distinct`](/operators/04-distinctness#distinct-ts), [`distinctUntilChanged`](/operators/04-distinctness#distinctuntilchanged-ts), [`distinctUntilKeyChanged`](/operators/04-distinctness#distinctuntilkeychanged-ts), [`ignoreElements`](/operators/06-notification-side-effects#ignoreelements-ts), [`partition`](/observables/04-combination-join#partition-ts), [`skip`](/operators/05-take-skip#skip-ts).

::: details Source

<<< ../../readable-rxjs/src/operators/filter.ts

:::

## `partition.ts`

The deprecated *operator* form (the creation-function form lives in the [observable tree](/observables/04-combination-join#partition-ts)). Splits one source into a tuple of two observables by delegating both branches through `filter`:

- Tuple order is `[matchingValues, nonMatchingValues]`.
- The second branch uses the negated predicate — so each subscriber of each branch gets its **own** source subscription and its own independent index sequence.

::: details Source

<<< ../../readable-rxjs/src/operators/partition.ts

:::
