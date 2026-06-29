# rxjs-code-refactored Project Plan

## Purpose

`rxjs-code-refactored` is a readable, behavior-compatible, TypeScript-modernized study edition of RxJS 7.8.x.

This project is source-to-source modernization for study and maintenance practice. It is not intended to replace official RxJS, publish a competing package, or alter public behavior.

## Upstream Snapshot

- Upstream checkout: `upstream-rxjs`
- Upstream branch inspected: `7.x`
- Git status at inspection: clean relative to `origin/7.x`
- Root `package.json` package version: `7.8.2`
- Root `package-lock.json` root package version: `7.8.1`
- License: Apache License 2.0 in `LICENSE.txt`

The package/package-lock version mismatch should be checked before relying on lockfile-exact installs in a copied working tree.

## Package Manager And Commands

The root repository uses npm:

- Root lockfile: `package-lock.json`
- No `packageManager` field was present in `package.json`
- Docs app has its own `docs_app/package.json` and `docs_app/package-lock.json`

Recommended root commands for the library checkout:

```sh
npm ci
npm run compile
npm test
```

Other relevant root scripts:

```sh
npm run build:package
npm run lint
npm run dtslint
npm run test:circular
npm run test:side-effects
npm run test:import
npm run test:esm
```

Notes:

- `npm run compile` builds the TypeScript project references for CommonJS, ESM, ESM5, type outputs, type specs, and the main spec project.
- `npm run build:package` cleans `dist`, runs `compile`, builds global bundles, prepares package output, and generates aliases.
- `npm test` runs Mocha against `spec/**/*-spec.ts` with `TS_NODE_PROJECT=tsconfig.mocha.json`.
- Browser test scripts are currently disabled by script body.

If `npm ci` fails because the lockfile is stale in a future copied working tree, use `npm install` only after recording the lockfile change as an intentional setup update.

## Current Source Layout

Top-level areas:

- `src/`: RxJS source and public entrypoints.
- `spec/`: runtime unit tests, including operator, observable, scheduler, subject, ajax, websocket, and helper specs.
- `spec-dtslint/`: type-level tests.
- `integration/`: import, side-effect, and SystemJS compatibility tests.
- `docs_app/`: Angular documentation application and docs tooling.
- `tools/`: build, bundle, package preparation, and repo utility scripts.
- `resources/CI-CD/`: CI/CD support documentation.

Important `src/` entrypoints:

- `src/index.ts`: main public package entrypoint.
- `src/operators/index.ts`: public operator exports.
- `src/ajax/index.ts`: ajax public entrypoint.
- `src/fetch/index.ts`: fetch public entrypoint.
- `src/testing/index.ts`: testing public entrypoint.
- `src/webSocket/index.ts`: webSocket public entrypoint.
- `src/Rx.global.js`: global bundle support file.

Important internal implementation areas:

- `src/internal/Observable.ts`, `Subscriber.ts`, `Subscription.ts`, `Subject.ts`: core observable/subscription types.
- `src/internal/operators/`: pipeable operator implementations.
- `src/internal/observable/`: creation functions and static observable helpers.
- `src/internal/scheduler/`: scheduler implementations and providers.
- `src/internal/scheduled/`: scheduled input handling.
- `src/internal/testing/`: TestScheduler and marble-testing internals.
- `src/internal/util/`: shared utilities, errors, type guards, and helper functions.
- `src/internal/ajax/`: ajax implementation details.
- `src/internal/symbol/`: symbol shims.

Testing layout mirrors source layout closely:

- `spec/operators/*-spec.ts` covers pipeable operators.
- `spec/observables/*-spec.ts` covers creation functions.
- `spec/schedulers/`, `spec/subjects/`, `spec/testing/`, `spec/util/`, `spec/ajax/`, and `spec/websocket/` cover corresponding internals and public APIs.

## Working Strategy

1. Keep `upstream-rxjs` as the inspection baseline until an explicit copy/refactor step is started.
2. Create or designate a separate editable study working tree before modifying RxJS source.
3. Refactor one small file or closely related pair at a time.
4. Preserve exported names, overloads, deprecation markers, runtime ordering, errors, subscription behavior, and scheduler behavior.
5. Run focused tests after each change, then periodic broader checks.
6. Prefer readability and modern TypeScript only where it does not change generated behavior in observable ways.
7. Record each behavior-sensitive decision in the refactoring contract or change notes.

## First 10 Low-Risk Refactor Candidates

These candidates are small, localized operator files with existing runtime specs. They avoid schedulers, concurrency, multicasting, ajax, DOM event handling, and complex teardown trees.

1. `src/internal/operators/ignoreElements.ts`
   - Spec: `spec/operators/ignoreElements-spec.ts`
   - Low-risk reason: drops `next` values and forwards terminal events.

2. `src/internal/operators/defaultIfEmpty.ts`
   - Spec: `spec/operators/defaultIfEmpty-spec.ts`
   - Low-risk reason: simple state flag and completion-time default emission.

3. `src/internal/operators/throwIfEmpty.ts`
   - Spec: `spec/operators/throwIfEmpty-spec.ts`
   - Low-risk reason: simple empty-state check with configurable error factory.

4. `src/internal/operators/isEmpty.ts`
   - Spec: `spec/operators/isEmpty-spec.ts`
   - Low-risk reason: boolean result based on whether the source emits before completion.

5. `src/internal/operators/every.ts`
   - Spec: `spec/operators/every-spec.ts`
   - Low-risk reason: predicate/index handling and early false completion.

6. `src/internal/operators/count.ts`
   - Spec: `spec/operators/count-spec.ts`
   - Low-risk reason: small counter state, optional predicate, completion-time emission.

7. `src/internal/operators/pairwise.ts`
   - Spec: `spec/operators/pairwise-spec.ts`
   - Low-risk reason: local previous-value state and tuple emission.

8. `src/internal/operators/materialize.ts`
   - Spec: `spec/operators/materialize-spec.ts`
   - Low-risk reason: wraps notifications without changing subscription topology.

9. `src/internal/operators/dematerialize.ts`
   - Spec: `spec/operators/dematerialize-spec.ts`
   - Low-risk reason: unwraps notification objects through a compact implementation.

10. `src/internal/operators/min.ts` and `src/internal/operators/max.ts`
    - Specs: `spec/operators/min-spec.ts`, `spec/operators/max-spec.ts`
    - Low-risk reason: thin comparator-based wrappers around shared reduction behavior.

## Suggested Per-File Verification

For each operator candidate:

```sh
npm test -- --grep "<operator name>"
npm run compile
```

For candidates with type overload changes or public typings:

```sh
npm run dtslint
```

After a batch:

```sh
npm test
npm run lint
```
