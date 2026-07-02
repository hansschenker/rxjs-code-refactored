# DOM Integration

These files live under `readable-rxjs/src/observable/dom/` and integrate browser platform APIs: animation frames, `fetch`, and WebSockets. `rxjs/ajax` (upstream `src/internal/ajax/`) is **not** part of `internal/observable/` and remains upstream code; its spec still runs in the observable sweep.

Review log: [Observable Group 6](/04-semantic-review-log#observable-group-6-dom-integration)

Focused verification:

```sh
npm run test:operator -- spec/observables/dom/animationFrames-spec.ts spec/observables/dom/fetch-spec.ts spec/observables/dom/webSocket-spec.ts
```

## `animationFrames.ts`

Behavior-sensitive spots preserved:

- The default (no-argument) instance is a single shared observable created at module load time.
- Timestamp source selection matters: with a custom `timestampProvider` the elapsed time is computed from the provider; without one, the raw `requestAnimationFrame` callback timestamp is used.
- `requestId` is reset before the next frame is requested, keeping cancel-on-teardown correct.

::: details Source
<<< ../../readable-rxjs/src/observable/dom/animationFrames.ts
:::

## `fetch.ts` (`fromFetch`)

The readable rewrite names the abort coordination between the outer unsubscribe signal, a caller-provided `init.signal`, and response delivery.

Behavior-sensitive spots preserved:

- The `abortable` flag is flipped to `false` **before** `next`/`complete`/`error` fire, so a synchronous unsubscribe inside a handler never aborts a body that was already delivered.
- The outer-signal wiring order is kept: a caller signal that is already aborted aborts immediately; otherwise its listener is attached before the fetch starts.
- Each subscription builds its own `{...init, signal}` copy, so concurrent subscriptions do not share an AbortController.

::: details Source
<<< ../../readable-rxjs/src/observable/dom/fetch.ts
:::

## `webSocket.ts`

A thin factory returning `new WebSocketSubject(urlConfigOrSource)`.

::: details Source
<<< ../../readable-rxjs/src/observable/dom/webSocket.ts
:::

## `WebSocketSubject.ts`

The largest DOM file. The readable rewrite names the socket lifecycle phases and replaces the upstream `@ts-ignore` config initialization with definite-assignment assertions, without changing the public declaration surface.

Behavior-sensitive spots preserved:

- Socket handler assignment order is `onopen`, `onerror`, `onclose`, `onmessage`.
- `_output` is captured in a local **before** the constructor `try/catch`, so a throwing `WebSocketCtor` reports to the correct subject.
- `error()` requires a numeric close code in the payload, otherwise it throws a `TypeError` — this is API behavior, not validation sugar.
- `onclose` resets subject state only when the closing socket is still the current `_socket`.
- `multiplex` sends the unsubscribe message **before** tearing down the subscription.
- The destination starts as a `ReplaySubject` buffer and is swapped for a socket-writing subscriber after `openObserver.next`, replaying the queued messages into the open socket.

::: details Source
<<< ../../readable-rxjs/src/observable/dom/WebSocketSubject.ts
:::
