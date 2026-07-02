# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

A study edition of the RxJS 7.8.x operator implementation. All 117 operators in `readable-rxjs/src/operators/` are rewrites of the upstream RxJS source into more explicit, reviewable TypeScript — while preserving public behavior exactly. This is not an official RxJS distribution; it is a source-reading, refactoring, and documentation project derived from ReactiveX/RxJS (Apache-2.0, attribution must be preserved).

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
npm run test:operators                                 # full upstream operator spec suite (~2267 tests) against readable operators
npm run test:operator -- spec/operators/map-spec.ts    # one upstream operator spec (path relative to upstream-rxjs)
npm run test:readable                                  # readable-local specs in readable-rxjs/spec
```

Run from the repository root (VitePress docs):

```sh
npm install
npm run docs:dev      # serve docs at http://127.0.0.1:5173/
npm run docs:build
```

The root `dev`/`build`/`preview` scripts belong to a leftover Vite scaffold (`src/`, `index.html`) and are not part of the study project.

## Architecture: How Readable Operators Substitute for Upstream

The whole project hinges on two path-remapping layers that let the **unmodified upstream test suite** run against the readable operator tree:

1. **Compile time** — `readable-rxjs/tsconfig.json` extends the upstream tsconfig and remaps `rxjs/operators` and `rxjs/internal/operators/*` to `readable-rxjs/src/operators/`, while everything else (`rxjs`, `rxjs/testing`, `rxjs/internal/*`) still resolves to `upstream-rxjs/src/`.
2. **Runtime** — `readable-rxjs/spec/support/mocha-readable-path-mappings.js` patches Node's `Module._resolveFilename` so `require('rxjs/operators')` and `rxjs/internal/operators/<name>` resolve to the readable tree during `test:operators`.

Consequences of this design:

- Readable operator files import non-refactored internals by **relative path** into the upstream checkout, e.g. `import { operate } from '../../../upstream-rxjs/src/internal/util/lift'`. Only the operators themselves are rewritten; `Observable`, `Subscriber`, schedulers, etc. come from upstream.
- Shared operator internals that were rewritten live alongside the operators: `OperatorSubscriber.ts`, `mergeInternals.ts`, `scanInternals.ts`, `joinAllInternals.ts`.
- `readable-rxjs/src/operators/index.ts` mirrors the public `rxjs/operators` export surface and must stay in sync when operators change.

## Refactoring Contract (binding rules)

`docs/01-refactoring-contract.md` is the authoritative contract for any change to operator source. The essentials:

- Preserve runtime behavior exactly: emission values and ordering, error timing/identity, completion timing, subscription/teardown ordering, scheduler interaction, reentrancy behavior, and synchronous error paths.
- Preserve the public API: names, overload order and signatures, deprecation notices (deprecated signatures must be kept), generic constraints, and TypeScript inference/declaration output.
- Allowed: clearer names, small extracted helpers, equivalent clearer control flow, tighter internal-only types, short behavior comments on subtle logic.
- Per-change workflow: identify behavior invariants first, make the smallest useful change, run the focused operator spec (`npm run test:operator -- spec/operators/<name>-spec.ts`), then `check:types`, then broaden to `test:operators`.
- Keep `LICENSE.txt` and upstream attribution intact; never imply this is official RxJS.

## Documentation Structure

`docs/` is a VitePress site (config in `docs/.vitepress/config.ts`). Operator documentation is grouped into 13 semantic review groups (`docs/operators/01-*.md` through `13-*.md`, defined in `docs/02-operator-review-groups.md`), plus a tagged catalog at `docs/operators/catalog.md`. `docs/04-semantic-review-log.md` records the semantic review and verification results — update it when review-relevant changes are made.
