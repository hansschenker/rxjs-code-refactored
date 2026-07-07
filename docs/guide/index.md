# Study Guides

Cross-cutting guides that explain the machinery shared by many files in the readable tree. The group pages document *each file*; these pages document *the patterns between them*.

- [Anatomy Of An Operator](./operator-anatomy) — the `operate` → `OperatorSubscriber` → closure-state skeleton every operator is built on, traced end-to-end through `map`.
- [Flattening Strategies](./flattening-strategies) — `mergeMap`, `concatMap`, `switchMap`, and `exhaustMap` as one engine plus four policies.

First-hand upstream material worth reading alongside these: the official RxJS guides ship in the sibling checkout under `upstream-rxjs/docs_app/content/guide/` (also published at [rxjs.dev/guide/overview](https://rxjs.dev/guide/overview)), and the per-operator reference JSDoc — restored into the readable sources — renders directly in each group page's embedded source.
