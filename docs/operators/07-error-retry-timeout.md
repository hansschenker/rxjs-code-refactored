# Error, Retry, Repeat, And Timeout

These operators handle error recovery, resubscription, and timeouts.

Review log: [Group 7](/04-semantic-review-log#group-7-error-retry-repeat-and-timeout)

## `catchError.ts`

See also: [`onErrorResumeNext`](/observables/04-combination-join#onerrorresumenext-ts), [`repeat`](/operators/07-error-retry-timeout#repeat-ts), [`repeatWhen`](/operators/07-error-retry-timeout#repeatwhen-ts), [`retryWhen`](/operators/07-error-retry-timeout#retrywhen-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/catchError.ts
:::

## `onErrorResumeNextWith.ts`

See also: [`concat`](/observables/04-combination-join#concat-ts), [`catchError`](/operators/07-error-retry-timeout#catcherror-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/onErrorResumeNextWith.ts
:::

## `retry.ts`

See also: [`retryWhen`](/operators/07-error-retry-timeout#retrywhen-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/retry.ts
:::

## `retryWhen.ts`

See also: [`retry`](/operators/07-error-retry-timeout#retry-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/retryWhen.ts
:::

## `repeat.ts`

See also: [`repeatWhen`](/operators/07-error-retry-timeout#repeatwhen-ts), [`retry`](/operators/07-error-retry-timeout#retry-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/repeat.ts
:::

## `repeatWhen.ts`

See also: [`repeat`](/operators/07-error-retry-timeout#repeat-ts), [`retry`](/operators/07-error-retry-timeout#retry-ts), [`retryWhen`](/operators/07-error-retry-timeout#retrywhen-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/repeatWhen.ts
:::

## `timeout.ts`

See also: [`timeoutWith`](/operators/07-error-retry-timeout#timeoutwith-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/timeout.ts
:::

## `timeoutWith.ts`

See also: [`timeout`](/operators/07-error-retry-timeout#timeout-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/timeoutWith.ts
:::
