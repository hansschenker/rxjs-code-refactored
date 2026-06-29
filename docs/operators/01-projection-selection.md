# Projection And Simple Selection

These operators map, select, or split source values without changing subscription topology.

Review log: [Group 1](/04-semantic-review-log#group-1-projection-and-simple-selection)

Focused verification:

```sh
npm run test:operator -- spec/operators/map-spec.ts spec/operators/mapTo-spec.ts spec/operators/pluck-spec.ts spec/operators/filter-spec.ts spec/observables/partition-spec.ts
```

## `map.ts`

::: details Source

<<< ../../readable-rxjs/src/operators/map.ts

:::

## `mapTo.ts`

::: details Source

<<< ../../readable-rxjs/src/operators/mapTo.ts

:::

## `pluck.ts`

::: details Source

<<< ../../readable-rxjs/src/operators/pluck.ts

:::

## `filter.ts`

::: details Source

<<< ../../readable-rxjs/src/operators/filter.ts

:::

## `partition.ts`

::: details Source

<<< ../../readable-rxjs/src/operators/partition.ts

:::
