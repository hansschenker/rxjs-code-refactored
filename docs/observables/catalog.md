# Generated Observable Index

This index catalogs the readable observable tree by semantic group, tags, and spec coverage. It is generated from the current review grouping and source layout. Spec paths are relative to `upstream-rxjs/spec/observables/` unless prefixed with `spec/operators/`.

Legend:

- `public`: exported through the readable root index `readable-rxjs/src/index.ts` (or the `rxjs/fetch` / `rxjs/webSocket` entry indexes).
- `internal`: readable helper used by other observables/operators but not part of the public `rxjs` barrel.
- `deprecated`: RxJS 7 compatibility API or deprecated signature exists.
- `scheduler`: scheduler or timestamp-provider behavior matters.
- `stateful`: keeps cross-notification state.
- `teardown`: teardown/finalization behavior is behavior-sensitive.
- `direct spec`: has a focused upstream spec file.
- `related spec`: covered through related specs or the full sweeps.

## Summary

| Area | Count |
| --- | ---: |
| Observable creation files (`src/observable/`) | 30 |
| DOM integration files (`src/observable/dom/`) | 4 |
| Total readable observable files | 34 |

## Group 1: Creation Basics

Page: [Creation Basics](./01-creation-basics)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `innerFrom.ts` | internal, conversion, priority-order | related spec: `from-spec.ts`, `from-promise-spec.ts`, every flattening-operator spec |
| `from.ts` | public, conversion, deprecated, scheduler | direct spec: `from-spec.ts`, `from-promise-spec.ts` |
| `of.ts` | public, creation, deprecated, scheduler | direct spec: `of-spec.ts` |
| `empty.ts` | public, creation, deprecated, singleton, scheduler | direct spec: `empty-spec.ts` |
| `never.ts` | public, creation, deprecated, singleton | direct spec: `never-spec.ts` |
| `throwError.ts` | public, creation, error, deprecated, scheduler | direct spec: `throwError-spec.ts` |
| `range.ts` | public, creation, scheduler | direct spec: `range-spec.ts` |
| `defer.ts` | public, creation, factory | direct spec: `defer-spec.ts` |
| `iif.ts` | public, creation, factory | direct spec: `if-spec.ts` |
| `using.ts` | public, creation, resource, teardown, deprecated | direct spec: `using-spec.ts` |

## Group 2: Timing And Generation

Page: [Timing And Generation](./02-timing-generation)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `interval.ts` | public, timing, scheduler | direct spec: `interval-spec.ts` |
| `timer.ts` | public, timing, scheduler, stateful | direct spec: `timer-spec.ts` |
| `generate.ts` | public, generation, scheduler, deprecated, stateful | direct spec: `generate-spec.ts` |
| `pairs.ts` | public, generation, deprecated, scheduler | direct spec: `pairs-spec.ts` |

## Group 3: Events And Callbacks

Page: [Events And Callbacks](./03-events-callbacks)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `fromEvent.ts` | public, events, duck-typing, teardown | direct spec: `fromEvent-spec.ts` |
| `fromEventPattern.ts` | public, events, teardown | direct spec: `fromEventPattern-spec.ts` |
| `bindCallback.ts` | public, callbacks, deprecated, scheduler | direct spec: `bindCallback-spec.ts` |
| `bindNodeCallback.ts` | public, callbacks, deprecated, scheduler | direct spec: `bindNodeCallback-spec.ts` |
| `bindCallbackInternals.ts` | internal, callbacks, scheduler, stateful, shared-internal | related spec: `bindCallback-spec.ts`, `bindNodeCallback-spec.ts` (32 tests) |
| `fromSubscribable.ts` | internal, conversion, subject | related spec: `spec/operators/connect-spec.ts` |

## Group 4: Combination And Join

Page: [Combination And Join](./04-combination-join)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `combineLatest.ts` | public, combination, deprecated, scheduler, stateful | direct spec: `combineLatest-spec.ts` |
| `concat.ts` | public, combination, ordered, deprecated, scheduler | direct spec: `concat-spec.ts` |
| `merge.ts` | public, combination, concurrency, deprecated, scheduler | direct spec: `merge-spec.ts` |
| `race.ts` | public, race, deprecated, teardown | direct spec: `race-spec.ts` |
| `zip.ts` | public, combination, stateful, deprecated, teardown | direct spec: `zip-spec.ts` |
| `forkJoin.ts` | public, combination, terminal, deprecated, teardown | direct spec: `forkJoin-spec.ts` |
| `onErrorResumeNext.ts` | public, error, sequencing, teardown | direct spec: `onErrorResumeNext-spec.ts` |
| `partition.ts` | public, selection, conversion | direct spec: `partition-spec.ts` |

## Group 5: Multicasting

Page: [Multicasting](./05-multicasting)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `ConnectableObservable.ts` | public, multicasting, deprecated, subject, teardown, stateful | related spec: `spec/operators/` multicast, publish, publishBehavior, publishLast, publishReplay, refCount, share, connect specs (253 tests) |
| `connectable.ts` | public, multicasting, subject, teardown | direct spec: `connectable-spec.ts` |

## Group 6: DOM Integration

Page: [DOM Integration](./06-dom-integration)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `dom/animationFrames.ts` | public, dom, timing, singleton, teardown | direct spec: `dom/animationFrames-spec.ts` |
| `dom/fetch.ts` | public, dom, abort, teardown | direct spec: `dom/fetch-spec.ts` |
| `dom/webSocket.ts` | public, dom, factory | direct spec: `dom/webSocket-spec.ts` |
| `dom/WebSocketSubject.ts` | public, dom, subject, stateful, teardown | direct spec: `dom/webSocket-spec.ts` |

## Export Surface

| File | Tags | Coverage |
| --- | --- | --- |
| `src/index.ts` | barrel, public-export-surface | mirrors upstream `src/index.ts` export-for-export; exercised by every spec importing `rxjs` |
| `src/fetch/index.ts` | barrel, entry-point | `rxjs/fetch` entry; exercised by `dom/fetch-spec.ts` |
| `src/webSocket/index.ts` | barrel, entry-point | `rxjs/webSocket` entry; exercised by `dom/webSocket-spec.ts` |

## Indirect Coverage Notes

Four files have no dedicated spec file and are covered indirectly:

- `innerFrom.ts`: via `from-spec.ts`, `from-promise-spec.ts`, and every flattening-operator spec.
- `bindCallbackInternals.ts`: via the `bindCallback`/`bindNodeCallback` specs (32 tests).
- `fromSubscribable.ts`: via the operator `connect-spec.ts`.
- `ConnectableObservable.ts`: via the operator `multicast`/`publish*`/`refCount`/`share`/`connect` specs (253 tests).

`iif.ts` has a dedicated spec under a different name: `if-spec.ts`.

`rxjs/ajax` (upstream `src/internal/ajax/`) is not part of `internal/observable/` and remains upstream code; `dom/ajax-spec.ts` still runs in the observable sweep against upstream.

## Broad Verification

Latest verification (2026-07-02, Node 24.16.0, Windows):

```text
npm run check:types: passed
npm run test:readable: 4 passing
npm run test:operators: 2264 passing, 3 pending
npm run test:observables: 522 passing, 2 failing (both pre-existing environment failures, identical against unmodified upstream)
```

The two `test:observables` failures are environmental, not rewrite regressions: the ajax "older IE" test asserts a pre-Node-20 V8 JSON error message (ajax is upstream code, out of rewrite scope), and the webSocket "no WebSocketCtor" test cannot fire on Node ≥ 22 because a global `WebSocket` now exists.
