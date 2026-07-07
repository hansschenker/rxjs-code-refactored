# Time And Rate-Limiting

These operators use schedulers, duration notifiers, or timestamp providers.

Review log: [Group 8](/04-semantic-review-log#group-8-time-and-rate-limiting)

## `delay.ts`

See also: [`delayWhen`](/operators/08-time-rate-limiting#delaywhen-ts), [`throttle`](/operators/08-time-rate-limiting#throttle-ts), [`throttleTime`](/operators/08-time-rate-limiting#throttletime-ts), [`debounce`](/operators/08-time-rate-limiting#debounce-ts), [`debounceTime`](/operators/08-time-rate-limiting#debouncetime-ts), [`sample`](/operators/08-time-rate-limiting#sample-ts), [`sampleTime`](/operators/08-time-rate-limiting#sampletime-ts), [`audit`](/operators/08-time-rate-limiting#audit-ts), [`auditTime`](/operators/08-time-rate-limiting#audittime-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/delay.ts
:::

## `delayWhen.ts`

See also: [`delay`](/operators/08-time-rate-limiting#delay-ts), [`throttle`](/operators/08-time-rate-limiting#throttle-ts), [`throttleTime`](/operators/08-time-rate-limiting#throttletime-ts), [`debounce`](/operators/08-time-rate-limiting#debounce-ts), [`debounceTime`](/operators/08-time-rate-limiting#debouncetime-ts), [`sample`](/operators/08-time-rate-limiting#sample-ts), [`sampleTime`](/operators/08-time-rate-limiting#sampletime-ts), [`audit`](/operators/08-time-rate-limiting#audit-ts), [`auditTime`](/operators/08-time-rate-limiting#audittime-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/delayWhen.ts
:::

## `debounce.ts`

See also: [`audit`](/operators/08-time-rate-limiting#audit-ts), [`auditTime`](/operators/08-time-rate-limiting#audittime-ts), [`debounceTime`](/operators/08-time-rate-limiting#debouncetime-ts), [`delay`](/operators/08-time-rate-limiting#delay-ts), [`sample`](/operators/08-time-rate-limiting#sample-ts), [`sampleTime`](/operators/08-time-rate-limiting#sampletime-ts), [`throttle`](/operators/08-time-rate-limiting#throttle-ts), [`throttleTime`](/operators/08-time-rate-limiting#throttletime-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/debounce.ts
:::

## `debounceTime.ts`

See also: [`audit`](/operators/08-time-rate-limiting#audit-ts), [`auditTime`](/operators/08-time-rate-limiting#audittime-ts), [`debounce`](/operators/08-time-rate-limiting#debounce-ts), [`sample`](/operators/08-time-rate-limiting#sample-ts), [`sampleTime`](/operators/08-time-rate-limiting#sampletime-ts), [`throttle`](/operators/08-time-rate-limiting#throttle-ts), [`throttleTime`](/operators/08-time-rate-limiting#throttletime-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/debounceTime.ts
:::

## `throttle.ts`

See also: [`throttleTime`](/operators/08-time-rate-limiting#throttletime-ts), [`audit`](/operators/08-time-rate-limiting#audit-ts), [`debounce`](/operators/08-time-rate-limiting#debounce-ts), [`delayWhen`](/operators/08-time-rate-limiting#delaywhen-ts), [`sample`](/operators/08-time-rate-limiting#sample-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/throttle.ts
:::

## `throttleTime.ts`

See also: [`auditTime`](/operators/08-time-rate-limiting#audittime-ts), [`debounceTime`](/operators/08-time-rate-limiting#debouncetime-ts), [`delay`](/operators/08-time-rate-limiting#delay-ts), [`sampleTime`](/operators/08-time-rate-limiting#sampletime-ts), [`throttle`](/operators/08-time-rate-limiting#throttle-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/throttleTime.ts
:::

## `audit.ts`

See also: [`auditTime`](/operators/08-time-rate-limiting#audittime-ts), [`debounce`](/operators/08-time-rate-limiting#debounce-ts), [`delayWhen`](/operators/08-time-rate-limiting#delaywhen-ts), [`sample`](/operators/08-time-rate-limiting#sample-ts), [`throttle`](/operators/08-time-rate-limiting#throttle-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/audit.ts
:::

## `auditTime.ts`

See also: [`audit`](/operators/08-time-rate-limiting#audit-ts), [`debounceTime`](/operators/08-time-rate-limiting#debouncetime-ts), [`delay`](/operators/08-time-rate-limiting#delay-ts), [`sampleTime`](/operators/08-time-rate-limiting#sampletime-ts), [`throttleTime`](/operators/08-time-rate-limiting#throttletime-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/auditTime.ts
:::

## `sample.ts`

See also: [`audit`](/operators/08-time-rate-limiting#audit-ts), [`debounce`](/operators/08-time-rate-limiting#debounce-ts), [`sampleTime`](/operators/08-time-rate-limiting#sampletime-ts), [`throttle`](/operators/08-time-rate-limiting#throttle-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/sample.ts
:::

## `sampleTime.ts`

See also: [`auditTime`](/operators/08-time-rate-limiting#audittime-ts), [`debounceTime`](/operators/08-time-rate-limiting#debouncetime-ts), [`delay`](/operators/08-time-rate-limiting#delay-ts), [`sample`](/operators/08-time-rate-limiting#sample-ts), [`throttleTime`](/operators/08-time-rate-limiting#throttletime-ts).

::: details Source
<<< ../../readable-rxjs/src/operators/sampleTime.ts
:::

## `timeInterval.ts`

::: details Source
<<< ../../readable-rxjs/src/operators/timeInterval.ts
:::

## `timestamp.ts`

::: details Source
<<< ../../readable-rxjs/src/operators/timestamp.ts
:::
