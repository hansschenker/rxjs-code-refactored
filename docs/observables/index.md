# Readable Observable Source

The pages in this section display the rewritten observable creation files from `readable-rxjs/src/observable` (including `dom/`).

Each group follows the semantic review structure from [Observable Review Groups](/05-observable-review-groups). Source blocks are included from the live files, so edits in `readable-rxjs` are reflected in the docs on rebuild.

All 34 upstream files from `src/internal/observable/` are rewritten and verified against the unmodified upstream spec suite. The readable root index `readable-rxjs/src/index.ts` mirrors the upstream `rxjs` export surface export-for-export, and the entry indexes `src/fetch/index.ts` and `src/webSocket/index.ts` mirror `rxjs/fetch` and `rxjs/webSocket`.

## Catalog

- [Generated Observable Index](./catalog)

## Groups

1. [Creation Basics](./01-creation-basics)
2. [Timing And Generation](./02-timing-generation)
3. [Events And Callbacks](./03-events-callbacks)
4. [Combination And Join](./04-combination-join)
5. [Multicasting](./05-multicasting)
6. [DOM Integration](./06-dom-integration)

## Useful Review Docs

- [Observable review groups](/05-observable-review-groups)
- [Semantic review log](/04-semantic-review-log)
- [Refactoring contract](/01-refactoring-contract)
