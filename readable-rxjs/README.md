# readable-rxjs

Readable, behavior-compatible study edition of selected RxJS 7.x source files.

This package is not official RxJS and is not intended as a replacement distribution. It depends on the sibling `upstream-rxjs` checkout for non-refactored internals and for the upstream test harness.

## Setup

Install dependencies in the upstream checkout:

```sh
cd ../upstream-rxjs
npm ci
```

## Test Commands

Run the full upstream operator suite against `readable-rxjs/src/operators`:

```sh
npm run test:operators
```

Run one focused upstream operator spec against the readable operator tree:

```sh
npm run test:operator -- spec/operators/ignoreElements-spec.ts
```

Run readable-local specs:

```sh
npm run test:readable
```

Run the readable-local `map` spec:

```sh
npm run test:map
```
