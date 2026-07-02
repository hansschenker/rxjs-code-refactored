# Generated Scheduler Index

This index catalogs the readable scheduler tree by semantic group, tags, and spec coverage. It is generated from the current review grouping and source layout. Spec paths are relative to `upstream-rxjs/spec/schedulers/`.

Legend:

- `rewrite`: genuine readable rewrite of the upstream file.
- `re-export`: **permanent identity-preserving re-export** of the upstream module — intentionally not rewritten (see [Virtual Time And Providers](./03-virtual-time-and-providers)).
- `public`: exported through the readable root index `readable-rxjs/src/index.ts`.
- `internal`: used by the scheduler machinery but not part of the public `rxjs` barrel.
- `singleton`: module-level scheduler instance whose object identity matters.
- `batching`: same-tick/same-frame action batching via the shared `scheduler._scheduled` handle.
- `provider`: timing-provider singleton that the upstream TestScheduler installs virtual-time delegates onto.
- `direct spec`: has a focused upstream spec file.
- `related spec`: covered through related specs or the full sweeps.

## Summary

| Area | Count |
| --- | ---: |
| Readable rewrites (`src/scheduler/`) | 14 |
| Identity-preserving re-exports (providers + `timerHandle`) | 7 |
| Total scheduler files | 21 |

## Group 1: Async Core

Page: [Async Core](./01-async-core)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `Action.ts` | rewrite, internal, base-class | related spec: every scheduler spec, all timing operator specs, `timer`/`interval` observable specs |
| `AsyncAction.ts` | rewrite, internal, timer, stateful, teardown | related spec: every scheduler spec, all timing operator specs, `timer`/`interval` observable specs |
| `AsyncScheduler.ts` | rewrite, internal, flush, reentrancy | related spec: every scheduler spec, all timing operator specs, `timer`/`interval` observable specs |
| `async.ts` | rewrite, public, singleton, deprecated | related spec: every timing operator spec (default scheduler), `timer-spec.ts`, `interval-spec.ts` |

## Group 2: Macro, Micro, And Frame Batching

Page: [Macro, Micro, And Frame Batching](./02-macro-micro-frame)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `AsapAction.ts` | rewrite, internal, batching, microtask | direct spec: `AsapScheduler-spec.ts` |
| `AsapScheduler.ts` | rewrite, internal, batching, flush | direct spec: `AsapScheduler-spec.ts` |
| `asap.ts` | rewrite, public, singleton, deprecated | direct spec: `AsapScheduler-spec.ts` |
| `QueueAction.ts` | rewrite, internal, synchronous, reentrancy | direct spec: `QueueScheduler-spec.ts` |
| `QueueScheduler.ts` | rewrite, internal, empty-subclass | direct spec: `QueueScheduler-spec.ts` |
| `queue.ts` | rewrite, public, singleton, deprecated | direct spec: `QueueScheduler-spec.ts` |
| `AnimationFrameAction.ts` | rewrite, internal, batching, frame | direct spec: `AnimationFrameScheduler-spec.ts` |
| `AnimationFrameScheduler.ts` | rewrite, internal, batching, flush | direct spec: `AnimationFrameScheduler-spec.ts` |
| `animationFrame.ts` | rewrite, public, singleton, deprecated | direct spec: `AnimationFrameScheduler-spec.ts` |

## Group 3: Virtual Time And Providers

Page: [Virtual Time And Providers](./03-virtual-time-and-providers)

| File | Tags | Spec coverage |
| --- | --- | --- |
| `VirtualTimeScheduler.ts` | rewrite, public, virtual-time, stateful | direct spec: `VirtualTimeScheduler-spec.ts` (upstream `TestScheduler` extends the upstream class; see note below) |
| `animationFrameProvider.ts` | **re-export**, internal, provider | direct spec: `animationFrameProvider-spec.ts` |
| `dateTimestampProvider.ts` | **re-export**, internal, provider | direct spec: `dateTimestampProvider-spec.ts` |
| `immediateProvider.ts` | **re-export**, internal, provider | related spec: `AsapScheduler-spec.ts`, every marble test |
| `intervalProvider.ts` | **re-export**, internal, provider | direct spec: `intervalProvider-spec.ts` |
| `performanceTimestampProvider.ts` | **re-export**, internal, provider | related spec: `dom/animationFrames-spec.ts`, every marble test |
| `timeoutProvider.ts` | **re-export**, internal, provider | direct spec: `timeoutProvider-spec.ts` |
| `timerHandle.ts` | **re-export**, internal, type-only | related spec: type-only module, no runtime behavior |

## Indirect Coverage Notes

`Action.ts`, `AsyncAction.ts`, `AsyncScheduler.ts`, and `async.ts` have no dedicated spec file. They are exercised by every scheduler spec (all the subclasses run through them), all timing operator specs (`delay`, `debounceTime`, `auditTime`, `sampleTime`, `throttleTime`, `bufferTime`, `windowTime`, `timeout`, ...), and the `timer`/`interval` observable specs.

`TestScheduler-spec.ts` runs in the scheduler sweep. The upstream `TestScheduler` still extends the **upstream** `VirtualTimeScheduler`; the readable `VirtualTimeScheduler` is exercised by its own spec. The provider specs exercise upstream provider code **through** the readable re-export modules, because the runtime path mapping resolves `rxjs/internal/scheduler/*` to `readable-rxjs/src/scheduler/`.

The `Scheduler` base class (`src/internal/Scheduler.ts`) lives outside the scheduler directory and remains upstream code.

## Broad Verification

Latest verification (2026-07-02, Node 24.16.0, Windows):

```text
npm run check:types: passed
npm run test:schedulers: 120 passing, 0 failing (identical to the upstream-config baseline)
npm run test:operators: 2264 passing, 3 pending
npm run test:observables: 522 passing, 2 failing (both pre-existing environment failures, identical against unmodified upstream)
npm run test:readable: 4 passing
```
