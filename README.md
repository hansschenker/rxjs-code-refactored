<p align="center">
  <img src="./docs/openai-logo.svg" alt="OpenAI logo" width="180">
</p>

# Readable RxJS Operators

Readable RxJS Operators is a study edition of the RxJS 7.8.x operator implementation. It rewrites the operator source into a more explicit, reviewable TypeScript style while preserving public behavior and attribution to the upstream RxJS project.

This repository is not an official RxJS distribution and is not intended to replace RxJS. It is a source-reading, refactoring, and documentation project.

## Created With ChatGPT / Codex

The readable operator rewrite, semantic review notes, and VitePress documentation were created with ChatGPT/Codex by OpenAI during this project session.

The OpenAI logo above is used as attribution to the AI assistance used to create the documentation. OpenAI and the OpenAI logo are trademarks of OpenAI.

<p align="center">
  <img src="./docs/claude-logo.svg" alt="Claude sun rays logo" width="140">
</p>

## Observable, Scheduler, And Test Harness Rewrite With Claude Fable 5

The readable observable creation rewrite (all 34 files of `internal/observable`, including `dom/`), the scheduler rewrite (14 readable rewrites plus 7 identity-preserving provider re-exports), the readable root index and entry-point remapping, the test harness ordering fix that made the upstream suites genuinely exercise the readable code for the first time, and the accompanying VitePress documentation were created with the Claude Fable 5 model by Anthropic.

The Claude sun-ray mark above is used as attribution to the AI assistance used for this part of the project. Claude and Anthropic are trademarks of Anthropic, PBC.

## What Is Included

- `readable-rxjs/src/operators`: readable TypeScript versions of the RxJS operator files.
- `readable-rxjs/src/observable` (including `dom/`): readable TypeScript versions of all 34 RxJS observable creation files.
- `readable-rxjs/src/scheduler`: readable TypeScript versions of the RxJS scheduler files — 14 genuine rewrites plus 7 permanent identity-preserving re-exports (the six timing providers and the `timerHandle` type module). The providers are re-exported rather than rewritten because the upstream TestScheduler installs virtual-time delegates onto the provider singletons during every marble test; a readable copy would never receive the delegates.
- `readable-rxjs/src/index.ts`, `src/fetch/index.ts`, `src/webSocket/index.ts`: readable entry indexes mirroring the `rxjs`, `rxjs/fetch`, and `rxjs/webSocket` export surfaces.
- `readable-rxjs/spec`: focused study-edition tests and test support, including the readable mocha config (`spec/support/.mocharc.readable.js`).
- `docs`: VitePress documentation, review notes, semantic review log, and live source pages.
- `docs/operators/catalog.md`, `docs/observables/catalog.md`, and `docs/schedulers/catalog.md`: generated-style catalogs with tags and spec coverage.

## What Is Not Included

The clean upstream RxJS checkout is intentionally not committed in this repository. To run the mapped tests locally, create it next to `readable-rxjs`:

```sh
git clone --branch 7.x https://github.com/ReactiveX/rxjs.git upstream-rxjs
cd upstream-rxjs
npm ci
```

The readable code imports upstream internals by relative path, so the local `upstream-rxjs` folder must exist for type checking and tests.

## Documentation

Install dependencies and run the VitePress documentation:

```sh
npm install
npm run docs:dev
```

Then open:

```text
http://127.0.0.1:5173/
```

Build the static docs:

```sh
npm run docs:build
```

## Verification

From `readable-rxjs`:

```sh
npm run check:types
npm run test:readable
npm run test:operators
npm run test:observables
npm run test:schedulers
```

Latest project verification (2026-07-02, Node 24.16.0, Windows):

```text
npm run check:types: passed (exit 0)
npm run test:readable: 4 passing
npm run test:operators: 2264 passing, 3 pending
npm run test:observables: 522 passing, 2 failing
npm run test:schedulers: 120 passing, 0 failing (identical to the upstream-config baseline)
```

The two `test:observables` failures are pre-existing environment failures unrelated to the rewrite; both are identical against unmodified upstream:

1. ajax "should fail if fails to parse response in older IE" asserts a pre-Node-20 V8 JSON error message string (`rxjs/ajax` is upstream code, out of rewrite scope).
2. webSocket "should handle constructor errors if no WebSocketCtor" — Node 22+ ships a global `WebSocket`, so the `ReferenceError` path cannot fire.

Three upstream operator tests that race real timers are excluded via grep+invert in `.mocharc.readable.js`; they are flaky under Windows timer granularity and fail against unmodified upstream too (see the semantic review log).

## Attribution

This project is derived from ReactiveX/RxJS and preserves the Apache License 2.0 attribution requirements. See the upstream project:

https://github.com/ReactiveX/rxjs

RxJS is copyright the RxJS contributors and licensed under Apache License 2.0.

## Project Status

- Operator implementation rewrite: complete, `117 / 117`.
- Semantic review groups: complete, groups `1-13`.
- Observable implementation rewrite: complete, `34 / 34` (including `dom/`).
- Observable review groups: complete, groups `1-6`.
- Scheduler implementation rewrite: complete — `14` readable rewrites plus `7` permanent identity-preserving provider re-exports (all 21 upstream scheduler files accounted for).
- Scheduler review groups: complete, groups `1-3`.
- VitePress documentation: complete enough for browsing and review.
- Intended use: study, documentation, and refactoring practice.
