<p align="center">
  <img src="https://cdn.simpleicons.org/openai/111111" alt="OpenAI logo" width="72" height="72">
</p>

# Readable RxJS Operators

Readable RxJS Operators is a study edition of the RxJS 7.8.x operator implementation. It rewrites the operator source into a more explicit, reviewable TypeScript style while preserving public behavior and attribution to the upstream RxJS project.

This repository is not an official RxJS distribution and is not intended to replace RxJS. It is a source-reading, refactoring, and documentation project.

## Created With ChatGPT / Codex

The readable operator rewrite, semantic review notes, and VitePress documentation were created with ChatGPT/Codex by OpenAI during this project session.

The OpenAI logo above is used as attribution to the AI assistance used to create the documentation. OpenAI and the OpenAI logo are trademarks of OpenAI.

## What Is Included

- `readable-rxjs/src/operators`: readable TypeScript versions of the RxJS operator files.
- `readable-rxjs/spec`: focused study-edition tests and test support.
- `docs`: VitePress documentation, review notes, semantic review log, and live source pages.
- `docs/operators/catalog.md`: generated-style operator catalog with tags and spec coverage.

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
```

Latest project verification recorded during the semantic review:

```text
npm run check:types: passed
npm run test:readable: 4 passing
npm run test:operators: 2267 passing, 3 pending
```

## Attribution

This project is derived from ReactiveX/RxJS and preserves the Apache License 2.0 attribution requirements. See the upstream project:

https://github.com/ReactiveX/rxjs

RxJS is copyright the RxJS contributors and licensed under Apache License 2.0.

## Project Status

- Operator implementation rewrite: complete, `117 / 117`.
- Semantic review groups: complete, groups `1-13`.
- VitePress documentation: complete enough for browsing and review.
- Intended use: study, documentation, and refactoring practice.
