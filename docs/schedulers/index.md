# Readable Scheduler Source

The pages in this section display the rewritten scheduler files from `readable-rxjs/src/scheduler`.

Each group follows the semantic review structure from [Scheduler Review Groups](/06-scheduler-review-groups). Source blocks are included from the live files, so edits in `readable-rxjs` are reflected in the docs on rebuild.

Of the 21 upstream files in `src/internal/scheduler/`, 14 are genuine readable rewrites verified against the unmodified upstream spec suite. The other 7 — the six timing providers and the `timerHandle` type module — are **permanent identity-preserving re-exports** of the upstream modules: the upstream TestScheduler installs virtual-time delegates onto the provider singletons during every marble-test run, so a readable copy would be a different object that never receives the delegates and would fire real timers inside virtual-time tests. See [Virtual Time And Providers](./03-virtual-time-and-providers) for the full explanation.

The readable root index `readable-rxjs/src/index.ts` exports `asap`/`asapScheduler`, `async`/`asyncScheduler`, `queue`/`queueScheduler`, `animationFrame`/`animationFrameScheduler`, and `VirtualTimeScheduler`/`VirtualAction` from `./scheduler/`, and the readable operator and observable trees import their scheduler defaults and providers from the readable scheduler directory.

## Catalog

- [Generated Scheduler Index](./catalog)

## Groups

1. [Async Core](./01-async-core)
2. [Macro, Micro, And Frame Batching](./02-macro-micro-frame)
3. [Virtual Time And Providers](./03-virtual-time-and-providers)

## Useful Review Docs

- [Scheduler review groups](/06-scheduler-review-groups)
- [Semantic review log](/04-semantic-review-log)
- [Refactoring contract](/01-refactoring-contract)
