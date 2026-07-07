# Timing And Generation

These observables produce values from schedulers, timers, and iteration state machines.

Review log: [Observable Group 2](/04-semantic-review-log#observable-group-2-timing-and-generation)

Focused verification:

```sh
npm run test:operator -- spec/observables/interval-spec.ts spec/observables/timer-spec.ts spec/observables/generate-spec.ts spec/observables/pairs-spec.ts
```

## `interval.ts`

See also: [`timer`](/observables/02-timing-generation#timer-ts), [`delay`](/operators/08-time-rate-limiting#delay-ts).

A thin wrapper over `timer(period, period, scheduler)` with negative-period clamping to zero.

::: details Source
<<< ../../readable-rxjs/src/observable/interval.ts
:::

## `timer.ts`

See also: [`interval`](/observables/02-timing-generation#interval-ts), [`delay`](/operators/08-time-rate-limiting#delay-ts).

The readable rewrite names the due-time and interval bookkeeping explicitly.

Behavior-sensitive spots preserved:

- Due-time arithmetic is `isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime`, with a negative result clamped to zero.
- `intervalDuration = -1` is the emit-once sentinel: after the first emission the observable completes instead of rescheduling.
- The self-rescheduling callback is a `function`, not an arrow function, so `this.schedule(...)` targets the scheduler action.

::: details Source
<<< ../../readable-rxjs/src/observable/timer.ts
:::

## `generate.ts`

See also: [`from`](/observables/01-creation-basics#from-ts).

The rewrite separates the config-object form from the positional form and names the shared iteration engine.

Behavior-sensitive spots preserved:

- The `arguments.length === 1` arity check decides whether the first argument is a config object — this is why the entry point cannot be an arrow function.
- A falsy fourth positional argument selects the identity `resultSelector`.
- The scheduler and no-scheduler paths split via `defer` plus `scheduleIterable`, matching upstream's scheduling behavior.

::: details Source
<<< ../../readable-rxjs/src/observable/generate.ts
:::

## `pairs.ts`

Deprecated in RxJS 7; delegates to `from(Object.entries(obj), scheduler)`. All four deprecated overloads are preserved.

::: details Source
<<< ../../readable-rxjs/src/observable/pairs.ts
:::
