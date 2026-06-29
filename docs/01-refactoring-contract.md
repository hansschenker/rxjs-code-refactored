# Refactoring Contract

This contract defines what must remain true while creating the TypeScript-modernized study edition of RxJS 7.8.x.

## Project Boundaries

- Preserve RxJS public behavior.
- Preserve public API names, module paths, overloads, deprecation notices, and documented semantics unless a later task explicitly scopes a compatibility investigation.
- Treat the project as a readable study edition, not a replacement distribution for official RxJS.
- Keep upstream attribution clear.
- Preserve the Apache License 2.0 text and any required notices.
- Do not modify the clean `upstream-rxjs` checkout until the project explicitly moves from inspection to an editable study copy.

## Compatibility Rules

Runtime behavior must stay compatible for:

- Emission values and ordering.
- Error timing and error identity where observable.
- Completion timing.
- Subscription and unsubscription timing.
- Teardown registration and teardown ordering.
- Synchronous behavior, including deprecated synchronous error handling paths that still exist in RxJS 7.
- Scheduler interaction and virtual-time behavior.
- Reentrancy-sensitive behavior.
- TypeScript type inference, overload selection, and public declaration output.
- Side-effect profile of public imports.

## Allowed Refactor Types

Allowed when covered by focused tests:

- Rename local variables for clarity.
- Extract small local helper functions when it reduces real complexity.
- Replace unclear control flow with equivalent clearer control flow.
- Tighten internal-only types without changing public declarations.
- Use modern TypeScript syntax where emitted behavior and declaration behavior remain compatible.
- Remove dead local comments only when they are not documentation, attribution, or behavior warnings.
- Add short behavior comments where existing logic is subtle.

## Disallowed Refactor Types Without Explicit Approval

- Changing public exports or import paths.
- Changing operator semantics.
- Changing scheduler defaults or timing.
- Changing error classes, messages, or creation timing.
- Changing subscription trees or teardown order.
- Changing overload order or public generic constraints.
- Removing deprecated signatures that still exist in RxJS 7.
- Replacing core observable, subscriber, subject, or scheduler architecture.
- Reformatting the whole repository.
- Updating dependencies as part of a source refactor.
- Editing generated artifacts unless the build process requires it and the change is reviewed separately.

## Attribution And License Requirements

- Keep `LICENSE.txt` with the Apache License 2.0 text.
- Keep upstream copyright and attribution notices.
- Make study-edition documentation clear that the work is derived from ReactiveX/RxJS.
- Do not imply the study edition is official RxJS.
- Track material modifications in project docs or changelog notes.

## Change Discipline

Each refactor should have:

- A narrow scope.
- A short rationale.
- A list of files changed.
- Focused runtime tests.
- Type tests when public typings or overloads could be affected.
- A note for any behavior-sensitive code path that was intentionally preserved.

Preferred loop:

1. Inspect the target file and its specs.
2. Identify behavior invariants before editing.
3. Make the smallest useful readability change.
4. Run the focused operator or unit spec.
5. Run `npm run compile`.
6. Broaden to `npm test`, `npm run lint`, and `npm run dtslint` when the batch touches public types or shared internals.

## Review Checklist

Before accepting a refactor:

- Public API surface is unchanged.
- Existing tests pass.
- New or updated tests cover any changed branch structure.
- No dependency updates were bundled into the refactor.
- No unrelated formatting churn was introduced.
- Generated output changes, if any, are explained.
- License and attribution files are unchanged or intentionally preserved.

## High-Risk Areas

Avoid these until the study project has a strong test rhythm:

- `Observable`, `Subscriber`, `Subscription`, and `Subject` core behavior.
- Schedulers and virtual time.
- Multicasting and sharing operators.
- Higher-order mapping and concurrency internals.
- Error handling utilities.
- Ajax, fetch, websocket, and DOM/event integrations.
- Side-effect and packaging behavior.
- Type-heavy public overload families.

## Baseline Commands

Initial library command set:

```sh
npm ci
npm run compile
npm test
npm run lint
npm run dtslint
```

Packaging and compatibility checks:

```sh
npm run build:package
npm run test:circular
npm run test:side-effects
npm run test:import
npm run test:esm
```

Use the narrowest command that proves the current change, then run broader checks before batching or publishing study milestones.
