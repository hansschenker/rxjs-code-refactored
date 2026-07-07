// IDENTITY-PRESERVING RE-EXPORT (intentionally not rewritten).
// config is a MUTABLE global settings object read at call time by both the
// readable and the upstream trees (Observable.forEach/toPromise Promise ctor,
// Subscriber's deprecated sync error handling, onUnhandledError, and
// onStoppedNotification). Tests mutate it through the root 'rxjs' export;
// a readable copy would be a second, unsynchronized settings object.
export * from '../../upstream-rxjs/src/internal/config';
