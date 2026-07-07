# Accumulation And Collection

These operators keep local state, collect values, or compare source emissions over time.

Review log: [Group 3](/04-semantic-review-log#group-3-accumulation-and-collection)

## `reduce.ts`

See also: [`count`](/operators/02-boolean-terminal#count-ts), [`expand`](/operators/10-higher-order-flattening#expand-ts), [`mergeScan`](/operators/10-higher-order-flattening#mergescan-ts), [`scan`](/operators/03-accumulation-collection#scan-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/reduce.ts
:::

## `scan.ts`

See also: [`expand`](/operators/10-higher-order-flattening#expand-ts), [`mergeScan`](/operators/10-higher-order-flattening#mergescan-ts), [`reduce`](/operators/03-accumulation-collection#reduce-ts), [`switchScan`](/operators/10-higher-order-flattening#switchscan-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/scan.ts
:::

## `scanInternals.ts`

::: details Source
<<< ../../readable-rxjs/src/operators/scanInternals.ts
:::

## `toArray.ts`

::: details Source
<<< ../../readable-rxjs/src/operators/toArray.ts
:::

## `min.ts`

See also: [`max`](/operators/03-accumulation-collection#max-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/min.ts
:::

## `max.ts`

See also: [`min`](/operators/03-accumulation-collection#min-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/max.ts
:::

## `pairwise.ts`

See also: [`buffer`](/operators/09-buffer-window#buffer-ts), [`bufferCount`](/operators/09-buffer-window#buffercount-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/pairwise.ts
:::

## `sequenceEqual.ts`

See also: [`combineLatest`](/observables/04-combination-join#combinelatest-ts), [`zip`](/observables/04-combination-join#zip-ts), [`withLatestFrom`](/operators/11-combination-join#withlatestfrom-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/sequenceEqual.ts
:::
