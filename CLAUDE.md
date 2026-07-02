# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

A study edition of the RxJS 7.8.x source. All 117 operators in `readable-rxjs/src/operators/`, all 34 observable creation files in `readable-rxjs/src/observable/` (including `dom/`), and 14 of the 21 scheduler files in `readable-rxjs/src/scheduler/` (the other 7 are permanent identity-preserving provider re-exports — see below) are rewrites of the upstream RxJS source into more explicit, reviewable TypeScript — while preserving public behavior exactly. This is not an official RxJS distribution; it is a source-reading, refactoring, and documentation project derived from ReactiveX/RxJS (Apache-2.0, attribution must be preserved).

## Required Setup: the `upstream-rxjs` Sibling Checkout

The `upstream-rxjs/` directory is a clean clone of RxJS's `7.x` branch and is **intentionally not committed**. Type checking and tests fail without it:

```sh
git clone --branch 7.x https://github.com/ReactiveX/rxjs.git upstream-rxjs
cd upstream-rxjs && npm ci
```

Do not modify files inside `upstream-rxjs/` — the refactoring contract (`docs/01-refactoring-contract.md`) requires it to stay pristine.

## Commands

Run from `readable-rxjs/` (each script internally `cd`s into `../upstream-rxjs` to use its toolchain and mocha harness):

```sh
npm run check:types                                    # tsc against readable-rxjs/tsconfig.json
npm run test:operators                                 # full upstream operator spec suite (~2264 tests) against readable operators
npm run test:observables                               # full upstream observable spec suite (~524 tests) against readable observables
npm run test:schedulers                                # full upstream scheduler spec suite (120 tests) against readable schedulers
npm run test:operator -- spec/operators/map-spec.ts    # one upstream spec (path relative to upstream-rxjs; works for spec/observables too)
npm run test:readable                                  # readable-local specs in readable-rxjs/spec
```

On Windows these npm scripts need a POSIX shell (they use `./node_modules/.bin/...` and `env`). Without one, invoke the tools directly from `upstream-rxjs/`:

```sh
node node_modules/mocha/bin/mocha --config ../readable-rxjs/spec/support/.mocharc.readable.js <specs>
node node_modules/typescript/lib/tsc.js -p ../readable-rxjs/tsconfig.json
```

Upstream pins TypeScript 4.2.4 — do not use post-4.2 syntax in readable code.

Run from the repository root (VitePress docs):

```sh
npm install
npm run docs:dev      # serve docs at http://127.0.0.1:5173/
npm run docs:build
```

The root `dev`/`build`/`preview` scripts belong to a leftover Vite scaffold (`src/`, `index.html`) and are not part of the study project.

## Architecture: How Readable Code Substitutes for Upstream

The whole project hinges on two path-remapping layers that let the **unmodified upstream test suite** run against the readable trees:

1. **Compile time** — `readable-rxjs/tsconfig.json` extends the upstream tsconfig and remaps the readable entry points and deep paths to `readable-rxjs/src/`, while everything else (`rxjs/testing`, core `rxjs/internal/*`) still resolves to `upstream-rxjs/src/`.
2. **Runtime** — `readable-rxjs/spec/support/mocha-readable-path-mappings.js` patches Node's `Module._resolveFilename` so `rxjs`, `rxjs/operators`, `rxjs/fetch`, `rxjs/webSocket`, `rxjs/internal/operators/*`, `rxjs/internal/observable/*`, and `rxjs/internal/scheduler/*` resolve to the readable tree during `test:operators`/`test:observables`/`test:schedulers`.

**Mocha config ordering is load-bearing.** `readable-rxjs/spec/support/.mocharc.readable.js` exists because mocha loads CLI `--require` flags **before** config-file requires. Each path mapper wraps the previously installed `Module._resolveFilename`, so the last-installed mapper runs first. With the readable hook passed via CLI `--require`, upstream's mapper installed last and won — every rxjs import was silently routed back to upstream. The config file fixes the order: upstream's mapper is required first, the readable mapper last, so the readable hook runs first and delegates non-readable paths to upstream. The config also grep-excludes three upstream operator tests that race real timers and are flaky under Windows timer granularity (they fail against unmodified upstream too).

Consequences of this design:

- Readable files import non-refactored internals by **relative path** into the upstream checkout, e.g. `import { operate } from '../../../upstream-rxjs/src/internal/util/lift'`. Only the operators, observable creation files, and scheduler files are rewritten; `Observable`, `Subscriber`, the `Scheduler` base class (`src/internal/Scheduler.ts`), etc. come from upstream.
- `readable-rxjs/src/scheduler/` holds 14 readable rewrites plus **7 permanent identity-preserving provider re-exports** (`animationFrameProvider`, `dateTimestampProvider`, `immediateProvider`, `intervalProvider`, `performanceTimestampProvider`, `timeoutProvider`, and the type-only `timerHandle`). The providers must NEVER be rewritten: upstream's TestScheduler installs virtual-time delegates onto the provider singletons during every marble-test run, so a readable copy would be a different object that never receives the delegates and would fire real timers in virtual-time tests. Each re-export file carries an explanatory header comment.
- Upstream's `TestScheduler` still extends the **upstream** `VirtualTimeScheduler`; the readable `VirtualTimeScheduler` is exercised by its own spec (`spec/schedulers/VirtualTimeScheduler-spec.ts`).
- Shared operator internals that were rewritten live alongside the operators: `OperatorSubscriber.ts`, `mergeInternals.ts`, `scanInternals.ts`, `joinAllInternals.ts`.
- `readable-rxjs/src/operators/index.ts` mirrors the public `rxjs/operators` export surface and must stay in sync when operators change.
- `readable-rxjs/src/index.ts` is the readable root index: it mirrors upstream `src/index.ts` **export-for-export**, routing operators to `./operators/*`, observable creation functions to `./observable/*`, and core/schedulers/utils/types to upstream. Entry indexes `src/fetch/index.ts` and `src/webSocket/index.ts` mirror `rxjs/fetch` and `rxjs/webSocket`.
- The readable operator tree imports observable internals from its **readable siblings** (not upstream), so there is a single identity for `EMPTY`, `NEVER`, and `ConnectableObservable` across both trees — `empty-spec` asserts `empty() === EMPTY`, and operator specs assert `instanceof ConnectableObservable`.
- `rxjs/ajax` (upstream `src/internal/ajax/`) is not part of `internal/observable/` and remains upstream code.

## Refactoring Contract (binding rules)

`docs/01-refactoring-contract.md` is the authoritative contract for any change to operator source. The essentials:

- Preserve runtime behavior exactly: emission values and ordering, error timing/identity, completion timing, subscription/teardown ordering, scheduler interaction, reentrancy behavior, and synchronous error paths.
- Preserve the public API: names, overload order and signatures, deprecation notices (deprecated signatures must be kept), generic constraints, and TypeScript inference/declaration output.
- Allowed: clearer names, small extracted helpers, equivalent clearer control flow, tighter internal-only types, short behavior comments on subtle logic.
- Per-change workflow: identify behavior invariants first, make the smallest useful change, run the focused operator spec (`npm run test:operator -- spec/operators/<name>-spec.ts`), then `check:types`, then broaden to `test:operators`.
- Keep `LICENSE.txt` and upstream attribution intact; never imply this is official RxJS.

## Documentation Structure

`docs/` is a VitePress site (config in `docs/.vitepress/config.ts`). Operator documentation is grouped into 13 semantic review groups (`docs/operators/01-*.md` through `13-*.md`, defined in `docs/02-operator-review-groups.md`), observable documentation into 6 groups (`docs/observables/01-*.md` through `06-*.md`, defined in `docs/05-observable-review-groups.md`), and scheduler documentation into 3 groups (`docs/schedulers/01-*.md` through `03-*.md`, defined in `docs/06-scheduler-review-groups.md`). Each area has a tagged catalog (`docs/operators/catalog.md`, `docs/observables/catalog.md`, `docs/schedulers/catalog.md`). `docs/04-semantic-review-log.md` records the semantic review and verification results — update it when review-relevant changes are made.
